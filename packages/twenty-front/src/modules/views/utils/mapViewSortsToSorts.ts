import { isDefined } from 'twenty-shared';

import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { ViewSort } from '../types/ViewSort';

export const mapViewSortsToSorts = (viewSorts: ViewSort[]): RecordSort[] => {
  return viewSorts
    .map((viewSort) => {
      return {
        id: viewSort.id,
        fieldMetadataId: viewSort.fieldMetadataId,
        direction: viewSort.direction,
      };
    })
    .filter(isDefined);
};
