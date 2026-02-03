import { type ViewSortDirection } from '~/generated/graphql';

export type ViewSort = {
  __typename: 'ViewSort';
  id: string;
  fieldMetadataId: string;
  createdAt?: string;
  updatedAt?: string;
  direction: ViewSortDirection;
  viewId: string;
};
