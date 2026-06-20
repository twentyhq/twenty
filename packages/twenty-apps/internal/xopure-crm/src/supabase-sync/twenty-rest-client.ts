import type { TwentyClientLike } from './types/twenty-client-like.type';
type JsonRecord = Record<string, unknown>;

type MutationEndpoint = {
  pluralApiName: string;
  method: 'POST' | 'PATCH';
};

type TwentyRestResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  text: () => Promise<string>;
  getHeader?: (name: string) => string | null;
};

export type TwentyRestFetch = (
  url: string,
  init: RequestInit,
) => Promise<TwentyRestResponse>;

export type TwentyRestClientOptions = {
  apiUrl: string;
  apiKey: string;
  fetchImpl?: TwentyRestFetch;
  /** Minimum delay between REST requests in milliseconds. Default 0. */
  requestDelayMs?: number;
  /** Maximum retry attempts on 429 rate-limit responses. Default 0. */
  maxRetries?: number;
  /** Base delay in milliseconds for exponential backoff on 429. Default 1000. */
  retryBaseDelayMs?: number;
  /** Maximum time to wait for a single Retry-After response in milliseconds. Default 30000. */
  maxRetryAfterMs?: number;
};

const QUERY_ENDPOINTS = new Set([
  'people',
  'xopureCustomers',
  'xopureAmbassadors',
  'xopureProducts',
  'xopureOrders',
  'xopureOrderLines',
  'xopureCommissions',
  'xopurePayments',
  'xopureReferralRelationships',
  'xopureSyncMaps',
]);

const MUTATION_ENDPOINTS: Record<string, MutationEndpoint> = {
  createPerson: { pluralApiName: 'people', method: 'POST' },
  updatePerson: { pluralApiName: 'people', method: 'PATCH' },
  createXopureCustomer: { pluralApiName: 'xopureCustomers', method: 'POST' },
  updateXopureCustomer: { pluralApiName: 'xopureCustomers', method: 'PATCH' },
  createXopureAmbassador: {
    pluralApiName: 'xopureAmbassadors',
    method: 'POST',
  },
  updateXopureAmbassador: {
    pluralApiName: 'xopureAmbassadors',
    method: 'PATCH',
  },
  createXopureProduct: { pluralApiName: 'xopureProducts', method: 'POST' },
  updateXopureProduct: { pluralApiName: 'xopureProducts', method: 'PATCH' },
  createXopureOrder: { pluralApiName: 'xopureOrders', method: 'POST' },
  updateXopureOrder: { pluralApiName: 'xopureOrders', method: 'PATCH' },
  createXopureOrderLine: { pluralApiName: 'xopureOrderLines', method: 'POST' },
  updateXopureOrderLine: { pluralApiName: 'xopureOrderLines', method: 'PATCH' },
  createXopureCommission: {
    pluralApiName: 'xopureCommissions',
    method: 'POST',
  },
  updateXopureCommission: {
    pluralApiName: 'xopureCommissions',
    method: 'PATCH',
  },
  createXopurePayment: { pluralApiName: 'xopurePayments', method: 'POST' },
  updateXopurePayment: { pluralApiName: 'xopurePayments', method: 'PATCH' },
  createXopureReferralRelationship: {
    pluralApiName: 'xopureReferralRelationships',
    method: 'POST',
  },
  updateXopureReferralRelationship: {
    pluralApiName: 'xopureReferralRelationships',
    method: 'PATCH',
  },
  createXopureSyncMap: { pluralApiName: 'xopureSyncMaps', method: 'POST' },
  updateXopureSyncMap: { pluralApiName: 'xopureSyncMaps', method: 'PATCH' },
};

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const singleEntry = (
  value: JsonRecord,
  message: string,
): [string, unknown] => {
  const entries = Object.entries(value);

  if (entries.length !== 1 || !entries[0]) {
    throw new Error(message);
  }

  return entries[0];
};

const normalizeApiUrl = (apiUrl: string): string => {
  const trimmedApiUrl = apiUrl.trim().replace(/\/+$/, '');

  if (!trimmedApiUrl) {
    throw new Error('Twenty REST API URL is required.');
  }

  if (trimmedApiUrl.endsWith('/rest')) {
    return trimmedApiUrl.slice(0, -'/rest'.length);
  }

  return trimmedApiUrl;
};

const defaultFetch: TwentyRestFetch = async (url, init) => {
  if (typeof globalThis.fetch !== 'function') {
    throw new Error('Fetch API is unavailable for Twenty REST requests.');
  }

  const response = await globalThis.fetch(url, init);

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    text: () => response.text(),
    getHeader: (name: string) => response.headers.get(name),
  };
};

const buildHeaders = (
  apiKey: string,
  includesBody: boolean,
): Record<string, string> => ({
  Accept: 'application/json',
  Authorization: `Bearer ${apiKey}`,
  ...(includesBody ? { 'Content-Type': 'application/json' } : {}),
});

const encodeFilterValue = (value: unknown): string =>
  String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const parseEqFilter = (
  filter: unknown,
): { fieldName: string; eqValue: unknown } => {
  if (!isRecord(filter)) {
    throw new Error('Twenty REST queries require a filter object.');
  }

  const [fieldName, condition] = singleEntry(
    filter,
    'Twenty REST queries support exactly one filter field.',
  );

  if (!isRecord(condition)) {
    throw new Error('Twenty REST query filters require an eq condition.');
  }

  const [operator, eqValue] = singleEntry(
    condition,
    'Twenty REST query filters support exactly one operator.',
  );

  if (operator !== 'eq') {
    throw new Error('Twenty REST query filters support only eq.');
  }

  return { fieldName, eqValue };
};

const parseQuery = (
  query: JsonRecord,
): { pluralApiName: string; first: number; fieldName?: string; eqValue?: unknown } => {
  const [pluralApiName, selection] = singleEntry(
    query,
    'Twenty REST queries support exactly one root field.',
  );

  if (!QUERY_ENDPOINTS.has(pluralApiName)) {
    throw new Error(`Unsupported Twenty query ${pluralApiName}.`);
  }

  if (!isRecord(selection) || !isRecord(selection.__args)) {
    throw new Error('Twenty REST queries require __args.');
  }

  const first = selection.__args.first;

  if (!Number.isInteger(first) || Number(first) < 1) {
    throw new Error('Twenty REST queries require a positive __args.first.');
  }

  const filter = selection.__args.filter;
  if (filter !== undefined) {
    const parsed = parseEqFilter(filter);
    return { pluralApiName, first: Number(first), ...parsed };
  }
  return { pluralApiName, first: Number(first) };
};

const parseMutation = (
  mutation: JsonRecord,
): {
  mutationName: string;
  endpoint: MutationEndpoint;
  id?: string;
  data: JsonRecord;
} => {
  const [mutationName, selection] = singleEntry(
    mutation,
    'Twenty REST mutations support exactly one root field.',
  );
  const endpoint = MUTATION_ENDPOINTS[mutationName];

  if (!endpoint) {
    throw new Error(`Unsupported Twenty mutation ${mutationName}.`);
  }

  if (!isRecord(selection) || !isRecord(selection.__args)) {
    throw new Error('Twenty REST mutations require __args.');
  }

  const data = selection.__args.data;

  if (!isRecord(data)) {
    throw new Error('Twenty REST mutations require __args.data.');
  }

  if (endpoint.method === 'POST') {
    return { mutationName, endpoint, data };
  }

  const id = selection.__args.id;

  if (typeof id !== 'string' || id.length === 0) {
    throw new Error('Twenty REST update mutations require a string __args.id.');
  }

  return { mutationName, endpoint, id, data };
};

const recordsFromPayload = (
  payload: unknown,
  pluralApiName: string,
): JsonRecord[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }

  if (!isRecord(payload)) {
    throw new Error('Twenty REST list response was not an object.');
  }

  const data = payload.data;

  if (Array.isArray(data)) {
    return data.filter(isRecord);
  }

  if (isRecord(data) && Array.isArray(data[pluralApiName])) {
    return data[pluralApiName].filter(isRecord);
  }

  const directValue = payload[pluralApiName];

  if (Array.isArray(directValue)) {
    return directValue.filter(isRecord);
  }

  if (isRecord(directValue) && Array.isArray(directValue.edges)) {
    return directValue.edges
      .map((edge) => (isRecord(edge) ? edge.node : null))
      .filter(isRecord);
  }

  throw new Error('Twenty REST list response did not contain records.');
};

const mutationRecordFromPayload = (
  payload: unknown,
  mutationName: string,
): JsonRecord => {
  if (!isRecord(payload)) {
    return {};
  }

  const directValue = payload[mutationName];

  if (isRecord(directValue)) {
    return directValue;
  }

  const data = payload.data;

  if (isRecord(data)) {
    const nestedValue = data[mutationName];

    return isRecord(nestedValue) ? nestedValue : data;
  }

  return payload;
};

const readJson = async (
  response: TwentyRestResponse,
  method: string,
  path: string,
): Promise<unknown> => {
  let body: string;

  try {
    body = await response.text();
  } catch {
    throw new Error(
      `Twenty REST response for ${method} ${path} could not be read.`,
    );
  }

  if (body.trim() === '') {
    return null;
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new Error(`Twenty REST response for ${method} ${path} was not JSON.`);
  }
};

export const createTwentyRestClient = (
  options: TwentyRestClientOptions,
): TwentyClientLike => {
  const baseUrl = normalizeApiUrl(options.apiUrl);
  const fetchImpl = options.fetchImpl ?? defaultFetch;

  if (!options.apiKey.trim()) {
    throw new Error('Twenty REST API key is required.');
  }
  let consecutive429s = 0;
  let throttleMultiplier = 1.0;

  const requestJson = async (params: {
    method: 'GET' | 'POST' | 'PATCH';
    path: string;
    body?: JsonRecord;
  }): Promise<unknown> => {
    const delayMs = options.requestDelayMs ?? 0;
    const maxRetries = options.maxRetries ?? 0;
    const retryBaseDelay = options.retryBaseDelayMs ?? 1000;
    const maxRetryAfterMs = options.maxRetryAfterMs ?? 30000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const adaptiveDelay = delayMs > 0
      ? Math.min(delayMs * throttleMultiplier, 120000)
      : 0;

    if (adaptiveDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, adaptiveDelay));
    }

    const url = `${baseUrl}${params.path}`;
    const includesBody = params.body !== undefined;

    let response: TwentyRestResponse;

    try {
      response = await fetchImpl(url, {
        method: params.method,
        headers: buildHeaders(options.apiKey, includesBody),
        ...(includesBody ? { body: JSON.stringify(params.body) } : {}),
      });
    } catch {
      throw new Error(
        `Twenty REST request failed for ${params.method} ${params.path}.`,
      );
    }

    if (!response.ok) {
      if (response.status === 429) {
        consecutive429s++;
        if (consecutive429s >= 3) {
          throttleMultiplier = Math.min(throttleMultiplier * 1.5, 120.0);
        }
        if (attempt < maxRetries) {
          const retryAfterHeader = response.getHeader?.('Retry-After') ?? response.getHeader?.('retry-after');
          let backoff: number;
          if (retryAfterHeader) {
            const seconds = Number(retryAfterHeader);
            backoff = Number.isNaN(seconds)
              ? retryBaseDelay * Math.pow(2, attempt)
              : Math.min(seconds * 1000, maxRetryAfterMs);
          } else {
            backoff = retryBaseDelay * Math.pow(2, attempt);
          }
          backoff = Math.min(backoff, 60000);
          backoff = Math.round(backoff * (0.75 + Math.random() * 0.5));
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }
        throw new Error(
          `Twenty REST request failed for ${params.method} ${params.path} after ${maxRetries} retries with status 429.`,
        );
      }
      throw new Error(
        `Twenty REST request failed for ${params.method} ${params.path} with status ${response.status}.`,
      );
    }

    consecutive429s = 0;
    if (throttleMultiplier > 1.0) {
      throttleMultiplier = Math.max(throttleMultiplier - 0.1, 1.0);
    }
    return readJson(response, params.method, params.path);
    }
  };

  return {
    query: async (query) => {
      const { pluralApiName, first, fieldName, eqValue } = parseQuery(query);
      const searchParams = new URLSearchParams();

      searchParams.set('limit', String(first));
      if (fieldName !== undefined && eqValue !== undefined) {
        searchParams.set(
          'filter',
          `${fieldName}[eq]:"${encodeFilterValue(eqValue)}"`,
        );
      }

      const payload = await requestJson({
        method: 'GET',
        path: `/rest/${pluralApiName}?${searchParams.toString()}`,
      });
      const records = recordsFromPayload(payload, pluralApiName);

      return {
        [pluralApiName]: {
          edges: records.map((node) => ({ node })),
        },
      };
    },
    mutation: async (mutation) => {
      const { mutationName, endpoint, id, data } = parseMutation(mutation);
      const path =
        endpoint.method === 'POST'
          ? `/rest/${endpoint.pluralApiName}`
          : `/rest/${endpoint.pluralApiName}/${encodeURIComponent(id ?? '')}`;
      const payload = await requestJson({
        method: endpoint.method,
        path,
        body: data,
      });

      return {
        [mutationName]: mutationRecordFromPayload(payload, mutationName),
      };
    },
  };
};
