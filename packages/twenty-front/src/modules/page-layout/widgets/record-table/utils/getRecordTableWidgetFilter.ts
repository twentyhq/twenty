import { type View } from '@/views/types/View';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';

export const getRecordTableWidgetFilter = ({
  viewFilters,
  viewFilterGroups,
}: Pick<View, 'viewFilters' | 'viewFilterGroups'>) => ({
  recordFilters: viewFilters.map(
    ({ id, fieldMetadataId, operand, value, viewFilterGroupId }) => ({
      id,
      fieldMetadataId,
      operand,
      value,
      recordFilterGroupId: viewFilterGroupId,
    }),
  ),
  recordFilterGroups: mapViewFilterGroupsToRecordFilterGroups(
    viewFilterGroups ?? [],
  ),
});
