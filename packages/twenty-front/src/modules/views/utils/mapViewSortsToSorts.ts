import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';
import { isDefined } from 'twenty-shared';

import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { ViewSort } from '../types/ViewSort';

export const mapViewSortsToSorts = (
  viewSorts: ViewSort[],
  availableSortDefinitions: SortDefinition[],
): RecordSort[] => {
  return viewSorts
    .map((viewSort) => {
      const availableSortDefinition = availableSortDefinitions.find(
        (sortDefinition) =>
          sortDefinition.fieldMetadataId === viewSort.fieldMetadataId,
      );

      if (!availableSortDefinition) return null;

      return {
        id: viewSort.id,
        fieldMetadataId: viewSort.fieldMetadataId,
        direction: viewSort.direction,
        definition: availableSortDefinition,
      };
    })
    .filter(isDefined);
};
