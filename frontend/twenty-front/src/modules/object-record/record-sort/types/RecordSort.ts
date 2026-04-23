import { type ViewSortDirection } from '~/generated-metadata/graphql';

export type RecordSort = {
  id: string;
  fieldMetadataId: string;
  direction: ViewSortDirection;
};
