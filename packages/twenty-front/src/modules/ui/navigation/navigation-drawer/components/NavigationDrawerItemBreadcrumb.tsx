import { NavigationDrawerSubItemState } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerSubItemState';
import styled from '@emotion/styled';

export type NavigationDrawerItemBreadcrumbProps = {
  state?: NavigationDrawerSubItemState;
  isDragging?: boolean;
};

const StyledNavigationDrawerItemBreadcrumbContainer = styled.div<{
  isDragging?: boolean;
}>`
  height: 28px;

  margin-left: 7.5px;
  margin-right: ${({ theme }) => theme.spacing(2)};
  width: 9px;
  visibility: ${({ isDragging }) => (isDragging ? 'hidden' : 'visible')};
`;

const StyledGapVerticalLine = styled.div<{ darker: boolean }>`
  background: ${({ theme, darker }) =>
    darker ? theme.font.color.tertiary : theme.border.color.strong};

  position: relative;
  top: -2px;

  height: 2px;
  width: 1px;
`;

const StyledSecondaryFullVerticalBar = styled.div<{ darker: boolean }>`
  background: ${({ theme, darker }) =>
    darker ? theme.font.color.tertiary : theme.border.color.strong};

  position: relative;
  top: -17px;
  height: 28px;
  width: 1px;
`;

const StyledRoundedProtrusion = styled.div<{ darker: boolean }>`
  position: relative;
  top: -2px;

  border-bottom-left-radius: 4px;

  border: 1px solid
    ${({ theme, darker }) =>
      darker ? theme.font.color.tertiary : theme.border.color.strong};

  ${({ darker }) => (darker ? 'z-index: 1;' : '')}

  border-top: none;
  border-right: none;
  height: 14px;
  width: 8px;
`;

export const NavigationDrawerItemBreadcrumb = ({
  state,
  isDragging,
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
    <StyledNavigationDrawerItemBreadcrumbContainer isDragging={isDragging}>
      <StyledGapVerticalLine darker={gapShouldBeDarker} />
      <StyledRoundedProtrusion darker={protrusionShouldBeDarker} />
      {showVerticalBar && (
        <StyledSecondaryFullVerticalBar darker={verticalBarShouldBeDarker} />
      )}
    </StyledNavigationDrawerItemBreadcrumbContainer>
  );
};
