import { type PageInfo } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

export type CommonPageInfo = {
  hasNextPage: NonNullable<PageInfo['hasNextPage']>;
  hasPreviousPage: NonNullable<PageInfo['hasPreviousPage']>;
  startCursor: string | null;
  endCursor: string | null;
};
