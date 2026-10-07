import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { DashboardFilterChipCrossFilterFrame } from '@/page-layout/dashboard-filters/components/DashboardFilterChipCrossFilterFrame';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useGetRecordFilterChipLabelValue } from '@/views/hooks/useGetRecordFilterChipLabelValue';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';

type DashboardFilterChipButtonProps = {
  slot: DashboardFilterSlot;
  recordFilter: RecordFilter | null;
  Icon: IconComponent;
  testId: string;
  onClick: () => void;
  onRemove: () => void;
  isCrossFilter?: boolean;
};

export const DashboardFilterChipButton = ({
  slot,
  recordFilter,
  Icon,
  testId,
  onClick,
  onRemove,
  isCrossFilter = false,
}: DashboardFilterChipButtonProps) => {
  const { getRecordFilterChipLabelValue } = useGetRecordFilterChipLabelValue();

  const labelValue = isDefined(recordFilter)
    ? getRecordFilterChipLabelValue({ recordFilter })
    : '';

  return (
    <DashboardFilterChipCrossFilterFrame isCrossFilter={isCrossFilter}>
      <SortOrFilterChip
        testId={testId}
        labelKey={slot.label}
        labelValue={labelValue}
        Icon={Icon}
        onRemove={onRemove}
        onClick={onClick}
        type="filter"
      />
    </DashboardFilterChipCrossFilterFrame>
  );
};
