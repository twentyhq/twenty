import { type NavigationDrawerSubItemState } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerSubItemState';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export type NavigationDrawerItemBreadcrumbProps = {
  state?: NavigationDrawerSubItemState;
};

const StyledNavigationDrawerItemBreadcrumbContainer = styled.div`
  height: 28px;

  margin-left: 7.5px;
  margin-right: ${themeCssVariables.spacing[2]};
  width: 9px;
`;

const StyledGapVerticalLine = styled.div<{ darker: boolean }>`
  background: ${({ darker }) =>
    darker
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.border.color.strong};

  position: relative;
  top: -2px;

  height: 2px;
  width: 1px;
`;

const StyledSecondaryFullVerticalBar = styled.div<{ darker: boolean }>`
  background: ${({ darker }) =>
    darker
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.border.color.strong};

  position: relative;
  top: -17px;
  height: 28px;
  width: 1px;
`;

const StyledRoundedProtrusion = styled.div<{ darker: boolean }>`
  border: 1px solid
    ${({ darker }) =>
      darker
        ? themeCssVariables.font.color.tertiary
        : themeCssVariables.border.color.strong};
  border-bottom-left-radius: 4px;

  border-right: none;

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
