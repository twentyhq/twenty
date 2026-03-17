import { type ViewSortDirection } from '~/generated-metadata/graphql';

export type ViewSort = {
  id: string;
  fieldMetadataId: string;
  createdAt?: string;
  updatedAt?: string;
  direction: ViewSortDirection;
  viewId?: string;
};
