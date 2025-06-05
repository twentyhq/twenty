import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isSoftDeleteFilterActiveComponentState } from '@/object-record/record-table/states/isSoftDeleteFilterActiveComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
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
  const setIsSoftDeleteFilterActive = useSetRecoilComponentStateV2(
    isSoftDeleteFilterActiveComponentState,
    viewBarId,
  );

  const { removeRecordFilter } = useRemoveRecordFilter();

  const { getIcon } = useIcons();

  const handleRemoveClick = () => {
    removeRecordFilter({ recordFilterId: recordFilter.id });

    setIsSoftDeleteFilterActive(false);
  };

  const ChipIcon = getIcon('IconTrash');

  return (
    <SortOrFilterChip
      testId={recordFilter.fieldMetadataId}
      variant={'danger'}
      labelValue={recordFilter.label ?? ''}
      Icon={ChipIcon}
      onRemove={handleRemoveClick}
      type="filter"
    />
  );
};
