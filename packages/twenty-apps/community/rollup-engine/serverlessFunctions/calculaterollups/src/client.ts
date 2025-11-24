import { getNestedValue } from './filtering';
import type { ChildRecord, RollupDefinition } from './types';

const RESOURCE_PLURALS: Record<string, string> = {
  person: 'people',
  gift: 'gifts',
  company: 'companies',
  opportunity: 'opportunities',
};

const RETRIABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const DEFAULT_PAGE_SIZE = 200;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 300;

type QueryParamPrimitive = string | number | boolean;
type QueryParamValue = QueryParamPrimitive | QueryParamPrimitive[];

const serializeFilterExpressions = (
  filters: Record<string, QueryParamValue>,
): string[] => {
  const expressions: string[] = [];

  Object.entries(filters).forEach(([field, rawValue]) => {
    if (rawValue === undefined || rawValue === null) {
      return;
    }

    if (Array.isArray(rawValue)) {
      if (rawValue.length === 0) {
        return;
      }
      const serializedValues = rawValue.map((entry) => JSON.stringify(entry)).join(',');
      expressions.push(`${field}[in]:${serializedValues}`);
      return;
    }

    expressions.push(`${field}[eq]:${JSON.stringify(rawValue)}`);
  });

  return expressions;
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  query?: Record<string, QueryParamValue>;
  body?: unknown;
  headers?: Record<string, string>;
}

interface ListPageOptions {
  filter?: Record<string, QueryParamValue>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  cursor?: string;
  limit?: number;
}

interface ListPage<T> {
  items: T[];
  hasNextPage: boolean;
  nextCursor?: string;
}

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const getResourceName = (objectName: string) => RESOURCE_PLURALS[objectName] ?? `${objectName}s`;

export class TwentyClient {
  private readonly baseUrl: string;

  constructor(
    private readonly apiKey: string,
    baseUrl: string,
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  private async fetchWithRetry(url: string, init: RequestInit, attempt = 1): Promise<Response> {
    const response = await fetch(url, init);
    if (response.ok) {
      return response;
    }

    if (RETRIABLE_STATUS.has(response.status) && attempt < MAX_RETRIES) {
      const delayMs = RETRY_BASE_DELAY_MS * attempt;
      await sleep(delayMs);
      return this.fetchWithRetry(url, init, attempt + 1);
    }

    const errorBody = await response.text();
    throw new Error(`Request failed (${response.status}): ${errorBody || 'no body returned'}`);
  }

  private appendQueryParams(url: URL, params: Record<string, QueryParamValue>) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((entry) => {
          url.searchParams.append(key, String(entry));
        });
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }

  private async request(resourcePath: string, options: RequestOptions = {}) {
    const { method = 'GET', query, body, headers = {} } = options;

    const url = resourcePath.startsWith('http')
      ? new URL(resourcePath)
      : new URL(`${this.baseUrl}/${resourcePath.replace(/^\/+/, '')}`);

    if (query) {
      this.appendQueryParams(url, query);
    }

    let serializedBody: string | undefined;

    if (body !== undefined) {
      serializedBody = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const mergedHeaders: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      ...headers,
    };

    if (serializedBody && !mergedHeaders['Content-Type']) {
      mergedHeaders['Content-Type'] = 'application/json';
    }

    const response = await this.fetchWithRetry(url.toString(), {
      method,
      headers: mergedHeaders,
      body: serializedBody,
    });

    if (response.status === 204) {
      return {};
    }

    const text = await response.text();
    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text) as unknown;
    } catch (error) {
      throw new Error(
        `Failed to parse JSON response from ${url.toString()}: ${(error as Error).message}`,
      );
    }
  }

  private extractRecords(body: unknown, resource: string): ChildRecord[] {
    if (typeof body !== 'object' || body === null) {
      return [];
    }
    const data = typeof (body as Record<string, unknown>).data === 'object'
      ? ((body as Record<string, unknown>).data as Record<string, unknown>)
      : undefined;

    const direct = data && Array.isArray(data[resource]) ? data[resource] : undefined;
    if (Array.isArray(direct)) {
      return direct as ChildRecord[];
    }

    const singular = resource.endsWith('s') ? resource.slice(0, -1) : resource;
    const singularMatch = data && Array.isArray(data[singular]) ? data[singular] : undefined;
    if (Array.isArray(singularMatch)) {
      return singularMatch as ChildRecord[];
    }

    const capitalized = resource.charAt(0).toUpperCase() + resource.slice(1);
    const findManyKey = `findMany${capitalized}`;
    const findMany = data && Array.isArray(data[findManyKey]) ? data[findManyKey] : undefined;
    if (Array.isArray(findMany)) {
      return findMany as ChildRecord[];
    }

    return [];
  }

  private extractPageInfo(body: unknown) {
    if (typeof body !== 'object' || body === null) {
      return undefined;
    }
    if (typeof (body as Record<string, unknown>).pageInfo === 'object') {
      return (body as Record<string, unknown>).pageInfo as Record<string, unknown>;
    }
    if (
      typeof (body as Record<string, unknown>).data === 'object' &&
      typeof ((body as Record<string, unknown>).data as Record<string, unknown>).pageInfo === 'object'
    ) {
      return ((body as Record<string, unknown>).data as Record<string, unknown>)
        .pageInfo as Record<string, unknown>;
    }
    return undefined;
  }

  private async listRecordsPage(
    resource: string,
    options: ListPageOptions = {},
  ): Promise<ListPage<ChildRecord>> {
    const query: Record<string, QueryParamValue> = {};
    const limit = options.limit ?? DEFAULT_PAGE_SIZE;
    query.limit = String(limit);

    if (options.cursor) {
      query.starting_after = options.cursor;
    }

    if (options.filter) {
      const filterExpressions = serializeFilterExpressions(options.filter);
      if (filterExpressions.length > 0) {
        query.filter = filterExpressions;
      }
    }

    if (options.orderBy) {
      Object.entries(options.orderBy).forEach(([field, direction]) => {
        query[`order_by[${field}]`] = direction;
      });
    }

    const response = await this.request(resource, {
      method: 'GET',
      query,
    });

    const items = this.extractRecords(response, resource);
    const pageInfo = this.extractPageInfo(response);
    const hasNextPage =
      !!pageInfo &&
      (Boolean(pageInfo.hasNextPage) ||
        Boolean(pageInfo.endCursor) ||
        Boolean(pageInfo.nextCursor));
    const nextCursor =
      (pageInfo && typeof pageInfo.endCursor === 'string' && pageInfo.endCursor) ||
      (pageInfo && typeof pageInfo.nextCursor === 'string' && pageInfo.nextCursor) ||
      undefined;

    return {
      items,
      hasNextPage,
      nextCursor,
    };
  }

  async listAllRecords(objectName: string, options: ListPageOptions = {}): Promise<ChildRecord[]> {
    const resource = getResourceName(objectName);
    const aggregated: ChildRecord[] = [];
    let cursor: string | undefined;
    let hasNext = true;

    while (hasNext) {
      const page = await this.listRecordsPage(resource, {
        ...options,
        cursor,
      });
      aggregated.push(...page.items);
      hasNext = page.hasNextPage && Boolean(page.nextCursor);
      cursor = hasNext ? page.nextCursor : undefined;
    }

    return aggregated;
  }

  async updateObject(objectName: string, id: string, payload: Record<string, unknown>) {
    const resource = getResourceName(objectName);
    await this.request(`${resource}/${id}`, {
      method: 'PATCH',
      body: payload,
    });
  }
}

export const ensureMapHasTargets = (
  container: Map<string, ChildRecord[]>,
  targetIds: Set<string> | undefined,
) => {
  if (!targetIds) {
    return;
  }
  targetIds.forEach((id) => {
    if (!container.has(id)) {
      container.set(id, []);
    }
  });
};

export const buildChildRecordIndex = async (
  definition: RollupDefinition,
  client: TwentyClient,
  parentIds: Set<string> | undefined,
): Promise<Map<string, ChildRecord[]>> => {
  if (parentIds && parentIds.size > 0) {
    const parentIdList = Array.from(parentIds);
    const result = new Map<string, ChildRecord[]>();
    const concurrency = 5;

    for (let index = 0; index < parentIdList.length; index += concurrency) {
      const slice = parentIdList.slice(index, index + concurrency);
      const batch = await Promise.all(
        slice.map(async (parentId) => {
          const records = await client.listAllRecords(definition.childObject, {
            filter: {
              [definition.relationField]: parentId,
            },
          });
          const filtered = records.filter((record) => {
            const relationValue = getNestedValue(record, definition.relationField);
            return typeof relationValue === 'string' && relationValue === parentId;
          });
          return { parentId, records: filtered };
        }),
      );
      batch.forEach(({ parentId, records }) => {
        result.set(parentId, records);
      });
    }

    ensureMapHasTargets(result, parentIds);
    return result;
  }

  const allRecords = await client.listAllRecords(definition.childObject);
  const grouped = new Map<string, ChildRecord[]>();
  allRecords.forEach((record) => {
    const relationValue = getNestedValue(record, definition.relationField);
    if (typeof relationValue !== 'string' || relationValue.trim().length === 0) {
      return;
    }
    if (!grouped.has(relationValue)) {
      grouped.set(relationValue, []);
    }
    grouped.get(relationValue)!.push(record);
  });
  return grouped;
};
