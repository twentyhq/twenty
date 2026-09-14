import { type NavigationDrawerSubItemState } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerSubItemState';
import { styled } from '@linaria/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

export type NavigationDrawerItemBreadcrumbProps = {
  state?: NavigationDrawerSubItemState;
};

const StyledNavigationDrawerItemBreadcrumbContainer = styled.div`
  height: 28px;

  margin-inline-end: ${themeCssVariables.spacing[2]};
  margin-inline-start: 7.5px;
  width: 9px;

  [data-dnd-dragging] & {
    display: none;
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    height: ${themeCssVariables.spacing[8]};
  }
`;

const StyledGapVerticalLine = styled.div<{ darker: boolean }>`
  background: ${({ darker }) =>
    darker
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.border.color.strong};

  height: 2px;
  position: relative;

  top: -2px;
  width: 1px;
`;

const StyledSecondaryFullVerticalBar = styled.div<{ darker: boolean }>`
  background: ${({ darker }) =>
    darker
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.border.color.strong};

  height: calc(${themeCssVariables.spacing[7]} + 1px);
  position: relative;
  top: -17px;
  width: 1px;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    height: calc(${themeCssVariables.spacing[8]} + 1px);
  }
`;

const StyledRoundedProtrusion = styled.div<{ darker: boolean }>`
  border: 1px solid
    ${({ darker }) =>
      darker
        ? themeCssVariables.font.color.tertiary
        : themeCssVariables.border.color.strong};
  // The elbow is the border minus two sides. Written physically it keeps its
  // left-hand shape under dir="rtl" and hangs off the wrong side of the item.
  border-end-start-radius: 4px;

  border-inline-end: none;

  border-top: none;

  height: 14px;

  position: relative;
  top: -2px;
  width: 8px;
  z-index: ${({ darker }) => (darker ? '1' : 'auto')};
`;

export const NavigationDrawerItemBreadcrumb = ({
  state,
}: NavigationDrawerItemBreadcrumbProps) => {
  const showVerticalBar =
    state !== 'last-not-selected' && state !== 'last-selected';

  const verticalBarShouldBeDarker = state === 'intermediate-before-selected';

  const protrusionShouldBeDarker =
    state === 'intermediate-selected' || state === 'last-selected';

  const gapShouldBeDarker =
    state === 'intermediate-before-selected' ||
    state === 'intermediate-selected' ||
    state === 'last-selected';

  return (
    <StyledNavigationDrawerItemBreadcrumbContainer>
      <StyledGapVerticalLine darker={gapShouldBeDarker} />
      <StyledRoundedProtrusion darker={protrusionShouldBeDarker} />
      {showVerticalBar && (
        <StyledSecondaryFullVerticalBar darker={verticalBarShouldBeDarker} />
      )}
    </StyledNavigationDrawerItemBreadcrumbContainer>
  );
};
