import { CHART_LEGEND_ITEM_THRESHOLD } from '@/page-layout/widgets/graph/constants/ChartLegendItemThreshold';
import styled from '@emotion/styled';

export type GraphWidgetLegendItem = {
  id: string;
  label: string;
  color: string;
};

type GraphWidgetLegendProps = {
  items: GraphWidgetLegendItem[];
  show?: boolean;
};

const StyledLegendContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: center;
  padding-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledLegendItem = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledLegendLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledDot = styled.div<{ color: string }>`
  background: ${({ color }) => color};
  border-radius: 50%;
  height: 6px;
  width: 6px;
  flex-shrink: 0;
`;

export const GraphWidgetLegend = ({
  items,
  show = true,
}: GraphWidgetLegendProps) => {
  const areThereTooManyItems = items.length > CHART_LEGEND_ITEM_THRESHOLD;

  const isItASingleItem = items.length === 1;

  const thereAreNoItems = items.length === 0;

  const shouldShowLegend =
    show && !areThereTooManyItems && !isItASingleItem && !thereAreNoItems;

  if (!shouldShowLegend) {
    return null;
  }

  return (
    <StyledLegendContainer>
      {items.map((item) => (
        <StyledLegendItem key={item.id}>
          <StyledDot color={item.color} />
          <StyledLegendLabel>{item.label}</StyledLegendLabel>
        </StyledLegendItem>
      ))}
    </StyledLegendContainer>
  );
};
