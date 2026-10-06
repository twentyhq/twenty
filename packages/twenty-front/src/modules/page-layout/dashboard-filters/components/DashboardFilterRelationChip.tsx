import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import {
  DashboardFilterChip,
  type DashboardFilterChipProps,
} from '@/page-layout/dashboard-filters/components/DashboardFilterChip';
import { useComputeRecordRelationFilterLabelValue } from '@/views/hooks/useComputeRecordRelationFilterLabelValue';

type DashboardFilterRelationChipProps = Omit<
  DashboardFilterChipProps,
  'labelValue'
> & {
  recordFilter: RecordFilter;
};

// Relation values only hold record ids, so the names in the label are fetched like for a view filter chip.
export const DashboardFilterRelationChip = ({
  recordFilter,
  slot,
  Icon,
  testId,
  boundChartCount,
  chartCount,
  onClick,
  onRemove,
}: DashboardFilterRelationChipProps) => {
  const { labelValue } = useComputeRecordRelationFilterLabelValue({
    recordFilter,
  });

  return (
    <DashboardFilterChip
      slot={slot}
      labelValue={labelValue}
      Icon={Icon}
      testId={testId}
      boundChartCount={boundChartCount}
      chartCount={chartCount}
      onClick={onClick}
      onRemove={onRemove}
    />
  );
};
