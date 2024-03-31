import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';
import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';
import { isDefined } from '~/utils/isDefined';

import { ViewSort } from '../types/ViewSort';

export const mapViewSortsToSorts = (
  viewSorts: ViewSort[],
  availableSortDefinitions: SortDefinition[],
): Sort[] => {
  return viewSorts
    .map((viewSort) => {
      const availableSortDefinition = availableSortDefinitions.find(
        (sortDefinition) =>
          sortDefinition.fieldMetadataId === viewSort.fieldMetadataId,
      );

      if (!availableSortDefinition) return null;
      return {
        fieldMetadataId: viewSort.fieldMetadataId,
        direction: viewSort.direction,
        definition: availableSortDefinition,
      };
    })
    .filter(isDefined);
};
