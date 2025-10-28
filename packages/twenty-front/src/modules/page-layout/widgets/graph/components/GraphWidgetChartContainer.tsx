import styled from '@emotion/styled';

type GraphWidgetChartContainerProps = {
  $isClickable?: boolean;
  $cursorSelector?: string;
};

const StyledGraphWidgetChartContainer = styled.div<GraphWidgetChartContainerProps>`
  flex: 1;
  position: relative;
  width: 100%;

  ${({ $isClickable, $cursorSelector }) =>
    $isClickable &&
    $cursorSelector &&
    `
    ${$cursorSelector} {
      cursor: pointer;
    }
  `}
`;

export const GraphWidgetChartContainer = StyledGraphWidgetChartContainer;
