import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { iSsoftDeleteFilterActiveComponentState } from '@/object-record/record-table/states/iSsoftDeleteFilterActiveComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useIcons } from 'twenty-ui/display';

type SoftDeleteFilterChipProps = {
  recordFilter: RecordFilter;
  viewBarId: string;
};

export const SoftDeleteFilterChip = ({
  recordFilter,
  viewBarId,
}: SoftDeleteFilterChipProps) => {
  const setISsoftDeleteFilterActive = useSetAtomComponentState(
    iSsoftDeleteFilterActiveComponentState,
    viewBarId,
  );

  const { removeRecordFilter } = useRemoveRecordFilter();

  const { getIcon } = useIcons();

  const handleRemoveClick = () => {
    removeRecordFilter({ recordFilterId: recordFilter.id });

    setISsoftDeleteFilterActive(false);
  };

  const ChipIcon = getIcon('IconTrash');

  return (
    <SortOrFilterChip
      testId={recordFilter.fieldMetadataId}
      variant="danger"
      labelValue={recordFilter.label ?? ''}
      Icon={ChipIcon}
      onRemove={handleRemoveClick}
      type="filter"
    />
  );
};
