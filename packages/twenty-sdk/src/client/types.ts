export type TwentyApiType = 'core' | 'metadata';

export type FindManyOptions = {
  filter?: string; // REST filter expression, e.g. "name[eq]:\"Acme\""
  orderBy?: string; // REST orderBy expression, e.g. "createdAt:desc,name:asc"
  limit?: number; // page size
  startingAfter?: string; // cursor forward
  endingBefore?: string; // cursor backward
  depth?: number; // relation depth
  includeDeleted?: boolean; // include soft-deleted records
};

export type FindOneOptions = {
  depth?: number;
};

export type UpdateManyOptions<T> = {
  filter?: string;
  data: Partial<T>;
};

export type DeleteManyOptions = {
  filter?: string;
  hard?: boolean; // hard delete when true (destroy)
};

export type RestoreManyOptions = {
  filter?: string;
};

export type PageInfo = {
  startCursor?: string | null;
  endCursor?: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type FindManyResponse<T> = {
  data: Record<string, T[]>; // { [collectionPlural]: T[] }
  totalCount?: number;
  pageInfo?: PageInfo;
};

export type FindOneResponse<T> = {
  data: Record<string, T>; // { [collectionSingular]: T }
};

export type CreateManyResponse<T> = {
  data: Record<string, T[]>;
};

export type CreateOneResponse<T> = {
  data: Record<string, T>;
};

export type UpdateManyResponse<T> = {
  data: Record<string, T[]>;
};

export type UpdateOneResponse<T> = {
  data: Record<string, T>;
};

export type DeleteResponse = {
  data?: unknown;
};

export type RestoreResponse<T> = {
  data: Record<string, T | T[]>;
};

export class TwentyApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'TwentyApiError';
    this.status = status;
    this.details = details;
  }
}
