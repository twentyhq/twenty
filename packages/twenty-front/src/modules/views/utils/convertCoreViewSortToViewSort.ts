import { type ViewSort } from '@/views/types/ViewSort';
import { type CoreViewSort, ViewSortDirection } from '~/generated/graphql';

export const convertCoreViewSortToViewSort = (
  coreViewSort: Omit<CoreViewSort, 'workspaceId'>,
): ViewSort => {
  return {
    __typename: 'ViewSort',
    id: coreViewSort.id,
    fieldMetadataId: coreViewSort.fieldMetadataId,
    direction:
      coreViewSort.direction === ViewSortDirection.ASC ? 'asc' : 'desc',
  };
};
