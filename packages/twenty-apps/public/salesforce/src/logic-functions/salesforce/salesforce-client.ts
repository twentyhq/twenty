import {
  SalesforceApiError,
  SalesforceAuthError,
  SalesforceConfigError,
} from 'src/logic-functions/salesforce/salesforce-errors';

const DEFAULT_API_VERSION = '62.0';
const MAX_API_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1_000;

export type SalesforceConfig = {
  instanceUrl: string;
  clientId: string;
  clientSecret: string;
  apiVersion: string;
};

export type SalesforceQueryResult<TRecord> = {
  totalSize: number;
  done: boolean;
  records: TRecord[];
};

export type SalesforceOrgInfo = {
  orgId: string;
  orgName: string;
  currencyIsoCode: string;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const getSalesforceConfig = (): SalesforceConfig => {
  const instanceUrl = process.env.SALESFORCE_INSTANCE_URL?.trim();
  const clientId = process.env.SALESFORCE_CLIENT_ID?.trim();
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET?.trim();
  const apiVersion =
    process.env.SALESFORCE_API_VERSION?.trim().replace(/^v/i, '') ||
    DEFAULT_API_VERSION;

  if (
    !isNonEmptyString(instanceUrl) ||
    !isNonEmptyString(clientId) ||
    !isNonEmptyString(clientSecret)
  ) {
    throw new SalesforceConfigError(
      'Salesforce connection is not configured. A server admin must set SALESFORCE_INSTANCE_URL, SALESFORCE_CLIENT_ID and SALESFORCE_CLIENT_SECRET in the app settings.',
    );
  }

  return {
    instanceUrl: instanceUrl.replace(/\/+$/, ''),
    clientId,
    clientSecret,
    apiVersion,
  };
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const parseSalesforceErrorBody = (
  body: string,
): { message: string; errorCode?: string } => {
  try {
    const parsed = JSON.parse(body) as unknown;

    if (Array.isArray(parsed) && parsed.length > 0) {
      const first = parsed[0] as { message?: string; errorCode?: string };

      return {
        message: first.message ?? body,
        errorCode: first.errorCode,
      };
    }

    if (typeof parsed === 'object' && parsed !== null) {
      const errorObject = parsed as {
        error?: string;
        error_description?: string;
        message?: string;
      };

      return {
        message:
          errorObject.error_description ??
          errorObject.message ??
          errorObject.error ??
          body,
        errorCode: errorObject.error,
      };
    }
  } catch {
    // Not JSON, fall through to raw body.
  }

  return { message: body };
};

export class SalesforceClient {
  private readonly config: SalesforceConfig;
  private accessToken: string | null = null;

  constructor(config?: SalesforceConfig) {
    this.config = config ?? getSalesforceConfig();
  }

  get apiVersion(): string {
    return this.config.apiVersion;
  }

  private async authenticate(): Promise<string> {
    const tokenUrl = `${this.config.instanceUrl}/services/oauth2/token`;
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    let response: Response;

    try {
      response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
    } catch (error) {
      throw new SalesforceAuthError(
        `Could not reach Salesforce at ${this.config.instanceUrl}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    const responseText = await response.text();

    if (!response.ok) {
      const { message } = parseSalesforceErrorBody(responseText);

      throw new SalesforceAuthError(
        `Salesforce authentication failed (${response.status}): ${message}. Check the Connected App credentials and make sure the Client Credentials flow is enabled with a run-as user.`,
      );
    }

    const tokenResponse = JSON.parse(responseText) as {
      access_token?: string;
    };

    if (!isNonEmptyString(tokenResponse.access_token)) {
      throw new SalesforceAuthError(
        'Salesforce returned no access token for the Client Credentials flow.',
      );
    }

    this.accessToken = tokenResponse.access_token;

    return this.accessToken;
  }

  private async request<TResponse>(path: string): Promise<TResponse> {
    const token = this.accessToken ?? (await this.authenticate());
    const url = `${this.config.instanceUrl}${path}`;

    let lastError: Error = new SalesforceApiError(
      'Salesforce request was not attempted.',
      0,
    );

    for (let attempt = 0; attempt <= MAX_API_RETRIES; attempt += 1) {
      if (attempt > 0) {
        await sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
      }

      let response: Response;

      try {
        response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${this.accessToken ?? token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        lastError = new SalesforceApiError(
          `Network error calling Salesforce: ${
            error instanceof Error ? error.message : String(error)
          }`,
          0,
        );
        continue;
      }

      if (response.ok) {
        return (await response.json()) as TResponse;
      }

      const responseText = await response.text();
      const { message, errorCode } = parseSalesforceErrorBody(responseText);

      // Expired or invalid session: refresh the token once and retry.
      if (response.status === 401) {
        this.accessToken = null;
        await this.authenticate();
        lastError = new SalesforceAuthError(
          `Salesforce session error: ${message}`,
        );
        continue;
      }

      if (response.status === 429 || response.status >= 500) {
        lastError = new SalesforceApiError(message, response.status, errorCode);
        continue;
      }

      throw new SalesforceApiError(message, response.status, errorCode);
    }

    throw lastError;
  }

  async query<TRecord>(soql: string): Promise<SalesforceQueryResult<TRecord>> {
    const path = `/services/data/v${this.config.apiVersion}/query?q=${encodeURIComponent(soql)}`;

    return await this.request<SalesforceQueryResult<TRecord>>(path);
  }

  async queryCount(soql: string): Promise<number> {
    const result = await this.query<never>(soql);

    return result.totalSize;
  }

  async getOrgInfo(): Promise<SalesforceOrgInfo> {
    const result = await this.query<{
      Id: string;
      Name: string;
      DefaultCurrencyIsoCode?: string;
    }>('SELECT Id, Name, DefaultCurrencyIsoCode FROM Organization');

    const organization = result.records[0];

    if (organization === undefined) {
      throw new SalesforceApiError(
        'Could not read the Salesforce Organization record.',
        0,
      );
    }

    return {
      orgId: organization.Id,
      orgName: organization.Name,
      currencyIsoCode: organization.DefaultCurrencyIsoCode ?? 'USD',
    };
  }
}
