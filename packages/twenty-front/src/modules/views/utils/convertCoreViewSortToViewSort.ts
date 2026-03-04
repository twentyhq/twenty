import type { CoreViewSort } from '~/generated-metadata/graphql';
import type { ViewSort } from '@/views/types/ViewSort';

export const convertCoreViewSortToViewSort = (
  coreViewSort: Pick<
    CoreViewSort,
    'id' | 'direction' | 'fieldMetadataId' | 'viewId'
  >,
): ViewSort => {
  return {
    __typename: 'ViewSort',
    id: coreViewSort.id,
    direction: coreViewSort.direction,
    fieldMetadataId: coreViewSort.fieldMetadataId,
    viewId: coreViewSort.viewId,
  };
};
