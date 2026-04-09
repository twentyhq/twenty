import { type PageInfo } from 'src/engine/api/rest/core/handlers/rest-api-base.handler';

export type CommonPageInfo = {
  hasNextPage: NonNullable<PageInfo['hasNextPage']>;
  hasPreviousPage: NonNullable<PageInfo['hasPreviousPage']>;
  startCursor: string | null;
  endCursor: string | null;
};
