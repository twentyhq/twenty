import {
  type TwentyApiType,
  type FindManyOptions,
  type FindOneOptions,
  type UpdateManyOptions,
  type DeleteManyOptions,
  type RestoreManyOptions,
  type FindManyResponse,
  type FindOneResponse,
  type CreateManyResponse,
  type CreateOneResponse,
  type UpdateManyResponse,
  type UpdateOneResponse,
  type DeleteResponse,
  type RestoreResponse,
  TwentyApiError,
} from './types';

export type TwentyClientOptions = {
  type: TwentyApiType;
  baseUrl?: string;
};

const buildQuery = (params: Record<string, any>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
};

export class Twenty {
  private readonly apiKey: string;
  private readonly type: TwentyApiType;
  private readonly baseUrl: string;

  constructor(apiKey: string | undefined, options: TwentyClientOptions) {
    this.apiKey = apiKey ?? process.env.TWENTY_API_URL ?? '';
    this.type = options.type;
    this.baseUrl = (
      options.baseUrl ??
      process.env.TWENTY_API_URL ??
      'http://localhost:3000'
    ).replace(/\/$/, '');
  }

  private get restBase() {
    // core => /rest ; metadata => /rest/metadata
    return this.type === 'metadata'
      ? `${this.baseUrl}/rest/metadata`
      : `${this.baseUrl}/rest`;
  }

  private async request<T = any>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.restBase}${path}`, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    const text = await res.text();
    let json: any = undefined;
    try {
      json = text ? JSON.parse(text) : undefined;
    } catch (_) {
      // not json
    }

    if (!res.ok) {
      throw new TwentyApiError(
        json?.message || res.statusText,
        res.status,
        json,
      );
    }

    return (json as T) ?? (undefined as unknown as T);
  }

  // GET /rest/:object
  async findMany<T = any>(
    objectNamePlural: string,
    options: FindManyOptions = {},
  ): Promise<FindManyResponse<T>> {
    const {
      filter,
      orderBy,
      limit,
      startingAfter,
      endingBefore,
      depth,
      includeDeleted,
    } = options;

    const query = buildQuery({
      filter,
      orderBy,
      limit,
      startingAfter,
      endingBefore,
      depth,
      includeDeleted,
    });

    return await this.request(
      `/` + encodeURIComponent(objectNamePlural) + query,
    );
  }

  // GET /rest/:object/:id
  async findOne<T = any>(
    objectNamePlural: string,
    id: string,
    options: FindOneOptions = {},
  ): Promise<FindOneResponse<T>> {
    const { depth } = options;
    const query = buildQuery({ depth });
    return await this.request(
      `/` +
        encodeURIComponent(objectNamePlural) +
        `/${encodeURIComponent(id)}${query}`,
    );
  }

  // POST /rest/:object
  async createOne<T = any>(
    objectNamePlural: string,
    data: Partial<T>,
  ): Promise<CreateOneResponse<T>> {
    return await this.request(`/` + encodeURIComponent(objectNamePlural), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // POST /rest/batch/:object
  async createMany<T = any>(
    objectNamePlural: string,
    data: Array<Partial<T>>,
  ): Promise<CreateManyResponse<T>> {
    return await this.request(
      `/batch/` + encodeURIComponent(objectNamePlural),
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  }

  // PATCH /rest/:object/:id
  async updateOne<T = any>(
    objectNamePlural: string,
    id: string,
    data: Partial<T>,
  ): Promise<UpdateOneResponse<T>> {
    return await this.request(
      `/` + encodeURIComponent(objectNamePlural) + `/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
  }

  // PATCH /rest/:object?filter=...
  async updateMany<T = any>(
    objectNamePlural: string,
    options: UpdateManyOptions<T>,
  ): Promise<UpdateManyResponse<T>> {
    const { filter, data } = options;
    const query = buildQuery({ filter });
    return await this.request(
      `/` + encodeURIComponent(objectNamePlural) + query,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
  }

  // DELETE /rest/:object/:id (soft delete)
  async deleteOne(
    objectNamePlural: string,
    id: string,
    hard: boolean = false,
  ): Promise<DeleteResponse> {
    const query = hard ? '?hard=true' : '';
    return await this.request(
      `/` +
        encodeURIComponent(objectNamePlural) +
        `/${encodeURIComponent(id)}${query}`,
      {
        method: 'DELETE',
      },
    );
  }

  // DELETE /rest/:object?filter=... (soft delete) or hard delete when hard=true
  async deleteMany(
    objectNamePlural: string,
    options: DeleteManyOptions = {},
  ): Promise<DeleteResponse> {
    const { filter, hard } = options;
    const query = buildQuery({ filter, hard });
    return await this.request(
      `/` + encodeURIComponent(objectNamePlural) + query,
      {
        method: 'DELETE',
      },
    );
  }

  // PATCH /rest/restore/:object/:id
  async restoreOne<T = any>(
    objectNamePlural: string,
    id: string,
  ): Promise<RestoreResponse<T>> {
    return await this.request(
      `/restore/` +
        encodeURIComponent(objectNamePlural) +
        `/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
      },
    );
  }

  // PATCH /rest/restore/:object?filter=...
  async restoreMany<T = any>(
    objectNamePlural: string,
    options: RestoreManyOptions = {},
  ): Promise<RestoreResponse<T[]>> {
    const { filter } = options;
    const query = buildQuery({ filter });
    return await this.request(
      `/restore/` + encodeURIComponent(objectNamePlural) + query,
      {
        method: 'PATCH',
      },
    );
  }

  // GET /rest/:object/groupBy?...
  async groupBy<T = any>(
    objectNamePlural: string,
    params: Record<string, string | number | boolean | undefined> = {},
  ): Promise<Record<string, any>> {
    const query = buildQuery(params as any);
    return await this.request(
      `/` + encodeURIComponent(objectNamePlural) + `/groupBy${query}`,
    );
  }

  // POST /rest/:object/duplicates
  async findDuplicates<T = any>(
    objectNamePlural: string,
    body: Record<string, any>,
  ): Promise<Record<string, T[]>> {
    return await this.request(
      `/` + encodeURIComponent(objectNamePlural) + `/duplicates`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    );
  }

  // PATCH /rest/:object/merge
  async mergeMany<T = any>(
    objectNamePlural: string,
    body: { ids: string[] } & Record<string, any>,
  ): Promise<Record<string, T>> {
    return await this.request(
      `/` + encodeURIComponent(objectNamePlural) + `/merge`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
    );
  }
}
