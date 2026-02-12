import styled from '@emotion/styled';

type GraphWidgetLegendDotProps = {
  color: string;
  className?: string;
};

const StyledDot = styled.div<{ color: string }>`
  background: ${({ color }) => color};
  border-radius: 2px;
  height: 8px;
  width: 8px;
  flex-shrink: 0;
`;

export const GraphWidgetLegendDot = ({
  color,
  className,
}: GraphWidgetLegendDotProps) => {
  return <StyledDot color={color} className={className} />;
};
