import { type RestCursorPageInfo } from 'src/engine/api/rest/metadata/types/rest-cursor-page-info.type';

export type MetadataRestListResponse<T> = {
  data: T[];
  pageInfo: RestCursorPageInfo;
  totalCount: number;
};
