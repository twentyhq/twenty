import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { areViewFiltersEqual } from '@/views/utils/areViewFiltersEqual';
import { mapRecordFilterToViewFilter } from '@/views/utils/mapRecordFilterToViewFilter';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

type GetAdHocViewFiltersForRecordIndexTabArgs = {
  viewFilters: ViewFilter[];
  recordFilters: RecordFilter[];
};

// Tab filters cannot belong to filter groups, and the saved view filters already apply on every tab
export const getAdHocViewFiltersForRecordIndexTab = ({
  viewFilters,
  recordFilters,
}: GetAdHocViewFiltersForRecordIndexTabArgs): ViewFilter[] =>
  recordFilters
    .filter(({ recordFilterGroupId }) => !isDefined(recordFilterGroupId))
    .map(mapRecordFilterToViewFilter)
    .filter((adHocViewFilter) => {
      const savedViewFilter = viewFilters.find(
        ({ id }) => id === adHocViewFilter.id,
      );

      return (
        !isDefined(savedViewFilter) ||
        !areViewFiltersEqual(savedViewFilter, adHocViewFilter)
      );
    })
    .map((adHocViewFilter) => ({
      ...adHocViewFilter,
      id: v4(),
      viewFilterGroupId: null,
      positionInViewFilterGroup: null,
    }));
