import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';

type PieChartCenterMetricProps = {
  data: PieChartDataItem[];
  formatOptions: GraphValueFormatOptions;
  show: boolean;
};

const StyledCenterMetricContainer = styled.div<{ show: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  left: 50%;
  opacity: ${({ show }) => (show ? 1 : 0)};
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: opacity ${({ theme }) => theme.animation.duration.fast}s
    ease-in-out;
`;

const StyledValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: clamp(12px, 10cqmin, 48px);
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: clamp(10px, 5cqmin, 24px);
`;

export const PieChartCenterMetric = ({
  data,
  formatOptions,
  show,
}: PieChartCenterMetricProps) => {
  const total = data.reduce((sum, datum) => sum + datum.value, 0);

  return (
    <StyledCenterMetricContainer show={show}>
      <StyledValue>{formatGraphValue(total, formatOptions)}</StyledValue>
      <StyledLabel>
        <Trans>Total</Trans>
      </StyledLabel>
    </StyledCenterMetricContainer>
  );
};
