import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import {
  DashboardFilterChipButton,
  type DashboardFilterChipButtonProps,
} from '@/page-layout/dashboard-filters/components/DashboardFilterChipButton';
import { useComputeRecordRelationFilterLabelValue } from '@/views/hooks/useComputeRecordRelationFilterLabelValue';

type DashboardFilterRelationChipButtonProps = Omit<
  DashboardFilterChipButtonProps,
  'labelValue'
> & {
  recordFilter: RecordFilter;
};

// Relation values only hold record ids, so the names in the label are fetched like for a view filter chip.
export const DashboardFilterRelationChipButton = ({
  recordFilter,
  slot,
  Icon,
  testId,
  boundWidgetCount,
  totalWidgetCount,
  onClick,
  onRemove,
}: DashboardFilterRelationChipButtonProps) => {
  const { labelValue } = useComputeRecordRelationFilterLabelValue({
    recordFilter,
  });

  return (
    <DashboardFilterChipButton
      slot={slot}
      labelValue={labelValue}
      Icon={Icon}
      testId={testId}
      boundWidgetCount={boundWidgetCount}
      totalWidgetCount={totalWidgetCount}
      onClick={onClick}
      onRemove={onRemove}
    />
  );
};
