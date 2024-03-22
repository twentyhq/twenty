import { SortDirection } from '@/object-record/object-sort-dropdown/types/SortDirection';

export type ViewSort = {
  __typename: 'ViewSort';
  id: string;
  fieldMetadataId: string;
  direction: SortDirection;
};
