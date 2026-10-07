import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

// A value a chart set is provisional: it is dropped on tab change. The dashed accent border tells it apart from
// a value the viewer picked, on top of the chip the view bar already uses.
const StyledDashboardFilterChipCrossFilterFrame = styled.div<{
  isCrossFilter: boolean;
}>`
  display: flex;

  & > div {
    border-color: ${({ isCrossFilter }) =>
      isCrossFilter
        ? themeCssVariables.accent.primary
        : themeCssVariables.accent.tertiary};
    border-style: ${({ isCrossFilter }) =>
      isCrossFilter ? 'dashed' : 'solid'};
  }
`;

export const DashboardFilterChipCrossFilterFrame =
  StyledDashboardFilterChipCrossFilterFrame;
