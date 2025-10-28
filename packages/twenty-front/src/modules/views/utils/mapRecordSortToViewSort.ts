import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { type CoreViewSort } from '~/generated/graphql';

export const mapRecordSortToViewSort = (
  recordSort: RecordSort,
  viewId: string,
): Pick<CoreViewSort, 'id' | 'fieldMetadataId' | 'direction' | 'viewId'> => {
  return {
    ...recordSort,
    viewId,
  };
};
