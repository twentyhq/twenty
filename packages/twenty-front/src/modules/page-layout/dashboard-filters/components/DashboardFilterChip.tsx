import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { styled } from '@linaria/react';
import { plural, t } from '@lingui/core/macro';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

// The tooltip trigger needs a DOM anchor and the chip component does not forward refs.
const StyledTooltipAnchor = styled.span`
  display: inline-flex;
`;

export type DashboardFilterChipProps = {
  slot: DashboardFilterSlot;
  labelValue: string;
  Icon: IconComponent;
  testId: string;
  boundChartCount: number;
  chartCount: number;
  onClick: () => void;
  onRemove: () => void;
};

export const DashboardFilterChip = ({
  slot,
  labelValue,
  Icon,
  testId,
  boundChartCount,
  chartCount,
  onClick,
  onRemove,
}: DashboardFilterChipProps) => {
  const tooltipContent = t`Applies to ${boundChartCount} of ${plural(
    chartCount,
    {
      one: '# chart',
      other: '# charts',
    },
  )}`;

  return (
    <Tooltip content={tooltipContent} delay={TooltipDelay.shortDelay}>
      <StyledTooltipAnchor>
        <SortOrFilterChip
          testId={testId}
          labelKey={slot.label}
          labelValue={labelValue}
          Icon={Icon}
          onRemove={onRemove}
          onClick={onClick}
          type="filter"
        />
      </StyledTooltipAnchor>
    </Tooltip>
  );
};
