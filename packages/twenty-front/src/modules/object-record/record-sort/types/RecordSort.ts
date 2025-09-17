import { type ViewSortDirection } from '~/generated/graphql';

export type RecordSort = {
  id: string;
  fieldMetadataId: string;
  direction: ViewSortDirection;
};
