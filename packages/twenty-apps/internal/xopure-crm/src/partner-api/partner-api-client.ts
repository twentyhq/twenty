const DEFAULT_REQUEST_DELAY_MS = 500;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_PAGE_LIMIT = 200;
const AMBASSADOR_PAGE_LIMIT = 500;
const DEFAULT_EXCEPTION_WINDOW_DAYS = 30;

export type PartnerApiConfig = {
  baseUrl: string;
  apiKey: string;
  fetchImpl?: typeof fetch;
  requestDelayMs?: number;
  maxRetries?: number;
};

export type FulfillmentExceptionEntry = {
  orderShort: string;
  fulfillmentStatus: string | null;
  shipheroSyncedAt: string | null;
  fulfillmentError: string | null;
  ageHours: number;
  flag: string;
};

export type FulfillmentExceptionSummary = {
  windowDays: number;
  exceptionCount: number;
  unresolvedInboundEvents: number;
  exceptions: FulfillmentExceptionEntry[];
};

type PartnerApiResponse = {
  data: unknown;
  next_cursor: string | null;
  generated_at: string;
};

type PartnerApiErrorBody = {
  error?: string;
  code?: string;
  retry_after_sec?: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const redactKey = (message: string, apiKey: string): string =>
  apiKey.length > 0 ? message.split(apiKey).join('[REDACTED]') : message;

const asString = (value: unknown): string | null =>
  typeof value === 'string' ? value : null;

const asNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const parseErrorBody = async (
  response: Response,
  apiKey: string,
): Promise<PartnerApiErrorBody> => {
  try {
    const text = await response.text();
    const parsed = JSON.parse(text);
    return isRecord(parsed) ? (parsed as PartnerApiErrorBody) : {};
  } catch {
    return {
      error: `HTTP ${response.status} ${redactKey(response.statusText, apiKey)}`,
    };
  }
};

type RequestError = Error & {
  status: number;
  code?: string;
  retryAfterSec?: number;
};

const singleRequest = async (
  url: string,
  apiKey: string,
  fetchImpl: typeof fetch,
): Promise<PartnerApiResponse> => {
  const response = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  });

  if (response.ok) {
    return (await response.json()) as PartnerApiResponse;
  }

  const errorBody = await parseErrorBody(response, apiKey);
  const error = new Error(errorBody.error ?? `Partner API HTTP ${response.status}`) as RequestError;
  error.status = response.status;
  error.code = errorBody.code;
  error.retryAfterSec = errorBody.retry_after_sec;
  throw error;
};

const requestWithRetry = async (
  url: string,
  config: PartnerApiConfig,
): Promise<PartnerApiResponse> => {
  const fetchImpl = config.fetchImpl ?? fetch;
  const maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await singleRequest(url, config.apiKey, fetchImpl);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const reqError = lastError as RequestError;
      const status = reqError.status;

      if (status === 401) {
        throw new Error('Partner API unauthorized — check XOPURE_PARTNER_API_KEY');
      }
      if (status === 403) {
        throw new Error('Partner API forbidden — key lacks required scope');
      }

      if (attempt >= maxRetries) break;

      if (status === 429) {
        const retryAfterSec = reqError.retryAfterSec ?? 1;
        await sleep(retryAfterSec * 1000);
        continue;
      }

      if (status !== undefined && status >= 500) {
        await sleep(2 ** attempt * 1000);
        continue;
      }

      break;
    }
  }

  throw lastError ?? new Error('Partner API request failed');
};

const buildUrl = (
  baseUrl: string,
  path: string,
  params: Record<string, string | undefined>,
): string => {
  const url = new URL(`${baseUrl}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, value);
  }
  return url.toString();
};

const fetchAllPages = async (
  config: PartnerApiConfig,
  path: string,
  baseParams: Record<string, string | undefined>,
): Promise<Record<string, unknown>[]> => {
  const requestDelayMs = config.requestDelayMs ?? DEFAULT_REQUEST_DELAY_MS;
  const allRows: Record<string, unknown>[] = [];
  let cursor: string | null = null;

  do {
    const params = { ...baseParams };
    if (cursor) params.cursor = cursor;

    const url = buildUrl(config.baseUrl, path, params);
    const body = await requestWithRetry(url, config);

    const rows = Array.isArray(body.data) ? (body.data as Record<string, unknown>[]) : [];
    allRows.push(...rows);
    cursor = body.next_cursor;

    if (cursor) await sleep(requestDelayMs);
  } while (cursor);

  return allRows;
};

const mapExceptionSummary = (data: unknown): FulfillmentExceptionSummary => {
  const record = isRecord(data) ? data : {};
  const rawExceptions = Array.isArray(record.exceptions) ? record.exceptions : [];
  const exceptions: FulfillmentExceptionEntry[] = rawExceptions.map((raw) => {
    const ex = isRecord(raw) ? raw : {};
    return {
      orderShort: String(ex.order_short ?? ''),
      fulfillmentStatus: asString(ex.fulfillment_status),
      shipheroSyncedAt: asString(ex.shiphero_synced_at),
      fulfillmentError: asString(ex.fulfillment_error),
      ageHours: asNumber(ex.age_hours) ?? 0,
      flag: asString(ex.flag) ?? 'unknown',
    };
  });

  return {
    windowDays: asNumber(record.window_days) ?? 0,
    exceptionCount: asNumber(record.exception_count) ?? exceptions.length,
    unresolvedInboundEvents: asNumber(record.unresolved_inbound_events) ?? 0,
    exceptions,
  };
};

export const createPartnerApiClient = (config: PartnerApiConfig) => {
  const fetchShipments = (updatedSince?: string): Promise<Record<string, unknown>[]> =>
    fetchAllPages(config, '/shipments', {
      updated_since: updatedSince,
      limit: String(DEFAULT_PAGE_LIMIT),
    });

  const fetchOrders = (updatedSince?: string): Promise<Record<string, unknown>[]> =>
    fetchAllPages(config, '/orders', {
      updated_since: updatedSince,
      limit: String(DEFAULT_PAGE_LIMIT),
    });

  const fetchAmbassadors = (): Promise<Record<string, unknown>[]> =>
    fetchAllPages(config, '/ambassadors', {
      limit: String(AMBASSADOR_PAGE_LIMIT),
    });

  const fetchFulfillmentExceptions = async (
    days: number = DEFAULT_EXCEPTION_WINDOW_DAYS,
  ): Promise<FulfillmentExceptionSummary> => {
    const url = buildUrl(config.baseUrl, '/fulfillment-exceptions', {
      days: String(Math.min(days, 90)),
    });
    const body = await requestWithRetry(url, config);
    return mapExceptionSummary(body.data);
  };

  return { fetchShipments, fetchOrders, fetchAmbassadors, fetchFulfillmentExceptions };
};

export const createPartnerApiClientFromEnv = (
  env?: Record<string, string | undefined>,
  configOverrides?: Partial<PartnerApiConfig>,
): ReturnType<typeof createPartnerApiClient> => {
  const resolvedEnv = env ?? process.env;
  const baseUrl = resolvedEnv.XOPURE_API_BASE_URL;
  const apiKey = resolvedEnv.XOPURE_PARTNER_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error(
      'XOPURE_API_BASE_URL and XOPURE_PARTNER_API_KEY are required for Partner API enrichment',
    );
  }

  return createPartnerApiClient({ baseUrl, apiKey, ...configOverrides });
};
