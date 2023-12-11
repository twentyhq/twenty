import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';

import { ViewSort } from '../types/ViewSort';

export const mapViewSortsToSorts = (viewSorts: ViewSort[]): Sort[] => {
  return viewSorts.map((viewSort) => {
    return {
      fieldMetadataId: viewSort.fieldMetadataId,
      direction: viewSort.direction,
      definition: viewSort.definition,
    };
  });
};
