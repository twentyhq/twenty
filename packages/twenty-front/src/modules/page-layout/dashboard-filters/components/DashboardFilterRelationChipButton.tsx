import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { DashboardFilterChipButton } from '@/page-layout/dashboard-filters/components/DashboardFilterChipButton';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useComputeRecordRelationFilterLabelValue } from '@/views/hooks/useComputeRecordRelationFilterLabelValue';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';

type DashboardFilterRelationChipButtonProps = {
  slot: DashboardFilterSlot;
  recordFilter: RecordFilter | null;
  Icon: IconComponent;
  testId: string;
  onClick: () => void;
  onRemove: () => void;
};

type DashboardFilterRelationChipButtonWithValueProps = Omit<
  DashboardFilterRelationChipButtonProps,
  'recordFilter'
> & {
  recordFilter: RecordFilter;
};

// Fetches the selected records, so it only mounts once the slot has a value.
const DashboardFilterRelationChipButtonWithValue = ({
  slot,
  recordFilter,
  Icon,
  testId,
  onClick,
  onRemove,
}: DashboardFilterRelationChipButtonWithValueProps) => {
  const { labelValue } = useComputeRecordRelationFilterLabelValue({
    recordFilter,
  });

  return (
    <SortOrFilterChip
      testId={testId}
      labelKey={slot.label}
      labelValue={labelValue}
      Icon={Icon}
      onRemove={onRemove}
      onClick={onClick}
      type="filter"
    />
  );
};

// A relation value is JSON of record ids, so the label resolves "Me" and record names the way the view bar does.
export const DashboardFilterRelationChipButton = ({
  slot,
  recordFilter,
  Icon,
  testId,
  onClick,
  onRemove,
}: DashboardFilterRelationChipButtonProps) =>
  isDefined(recordFilter) ? (
    <DashboardFilterRelationChipButtonWithValue
      slot={slot}
      recordFilter={recordFilter}
      Icon={Icon}
      testId={testId}
      onClick={onClick}
      onRemove={onRemove}
    />
  ) : (
    <DashboardFilterChipButton
      slot={slot}
      recordFilter={recordFilter}
      Icon={Icon}
      testId={testId}
      onClick={onClick}
      onRemove={onRemove}
    />
  );
