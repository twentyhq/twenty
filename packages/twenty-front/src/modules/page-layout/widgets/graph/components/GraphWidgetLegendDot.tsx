import { styled } from '@linaria/react';

type GraphWidgetLegendDotProps = {
  color: string;
  className?: string;
};

const StyledDot = styled.div<{ color: string }>`
  background: ${({ color }) => color};
  border-radius: 2px;
  flex-shrink: 0;
  height: 8px;
  width: 8px;
`;

export const GraphWidgetLegendDot = ({
  color,
  className,
}: GraphWidgetLegendDotProps) => {
  return <StyledDot color={color} className={className} />;
};
