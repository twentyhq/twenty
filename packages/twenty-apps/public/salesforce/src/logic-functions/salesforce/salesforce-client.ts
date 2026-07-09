import { listConnections } from 'twenty-sdk/logic-function';

import { SALESFORCE_CONNECTION_PROVIDER_NAME } from 'src/connection-providers/salesforce-connection';
import {
  SalesforceApiError,
  SalesforceAuthError,
  SalesforceConfigError,
} from 'src/logic-functions/salesforce/salesforce-errors';

const SALESFORCE_LOGIN_URL = 'https://login.salesforce.com';
const DEFAULT_API_VERSION = '62.0';
const MAX_API_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1_000;

export type SalesforceSession = {
  accessToken: string;
  instanceUrl: string;
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

export const getSalesforceApiVersion = (): string =>
  process.env.SALESFORCE_API_VERSION?.trim().replace(/^v/i, '') ||
  DEFAULT_API_VERSION;

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

// Reads the freshest OAuth token from the app's Salesforce connection. The
// server refreshes the access token on read, so every call gets a live token.
const fetchConnectionAccessToken = async (): Promise<string> => {
  const connections = await listConnections({
    providerName: SALESFORCE_CONNECTION_PROVIDER_NAME,
  });

  if (connections.length === 0) {
    throw new SalesforceConfigError(
      'No Salesforce connection found. Connect Salesforce from the application settings (Connections tab) before running a migration.',
    );
  }

  const usableConnections = connections.filter(
    (connection) => !connection.authFailedAt,
  );

  if (usableConnections.length === 0) {
    throw new SalesforceAuthError(
      'The Salesforce connection failed authentication. Reconnect Salesforce from the application settings (Connections tab).',
    );
  }

  const connection =
    usableConnections.find(
      (usableConnection) => usableConnection.visibility === 'workspace',
    ) ?? usableConnections[0];

  return connection.accessToken;
};

export class SalesforceClient {
  readonly apiVersion: string;
  private session: SalesforceSession | null;

  constructor(session?: SalesforceSession) {
    this.apiVersion = getSalesforceApiVersion();
    this.session = session ?? null;
  }

  // Salesforce API calls must target the org's own instance URL, which the
  // connection framework does not persist; the OpenID userinfo endpoint
  // resolves it from the access token.
  private async resolveInstanceUrl(accessToken: string): Promise<string> {
    let response: Response;

    try {
      response = await fetch(`${SALESFORCE_LOGIN_URL}/services/oauth2/userinfo`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (error) {
      throw new SalesforceApiError(
        `Could not reach Salesforce to resolve the org instance: ${
          error instanceof Error ? error.message : String(error)
        }`,
        0,
      );
    }

    if (!response.ok) {
      const { message } = parseSalesforceErrorBody(await response.text());

      throw new SalesforceAuthError(
        `Could not resolve the Salesforce instance (${response.status}): ${message}. Make sure the Connected App grants the openid scope and reconnect Salesforce.`,
      );
    }

    const userInfo = (await response.json()) as {
      urls?: Record<string, string>;
    };
    const restUrl = userInfo.urls?.rest ?? userInfo.urls?.profile;

    if (!isNonEmptyString(restUrl)) {
      throw new SalesforceAuthError(
        'Salesforce userinfo did not include the org instance URLs.',
      );
    }

    return new URL(restUrl.replace('{version}', this.apiVersion)).origin;
  }

  private async openSession(): Promise<SalesforceSession> {
    if (this.session !== null) {
      return this.session;
    }

    const accessToken = await fetchConnectionAccessToken();
    const instanceUrl = await this.resolveInstanceUrl(accessToken);

    this.session = { accessToken, instanceUrl };

    return this.session;
  }

  private async request<TResponse>(path: string): Promise<TResponse> {
    let session = await this.openSession();

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
        response = await fetch(`${session.instanceUrl}${path}`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
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

      // Expired session: re-read the connection (the server refreshes the
      // token on read) and retry.
      if (response.status === 401) {
        this.session = null;
        session = await this.openSession();
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
    const path = `/services/data/v${this.apiVersion}/query?q=${encodeURIComponent(soql)}`;

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
