import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { type CoreViewSort } from '~/generated/graphql';

export const mapRecordSortToViewSort = (
  recordSort: RecordSort,
): Pick<CoreViewSort, 'id' | 'fieldMetadataId' | 'direction'> => {
  return {
    ...recordSort,
  };
};
