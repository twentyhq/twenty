import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconSearch } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/primitives/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { MultiWorkspaceDropdownButton } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/MultiWorkspaceDropdownButton';
import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { NavigationDrawerCollapseButton } from './NavigationDrawerCollapseButton';

const StyledContainer = styled.div<{ isExpanded: boolean }>`
  align-items: ${({ isExpanded }) => (isExpanded ? 'center' : 'flex-start')};
  display: flex;
  flex-direction: ${({ isExpanded }) => (isExpanded ? 'row' : 'column')};
  flex-shrink: 0;
  gap: ${({ isExpanded }) => (isExpanded ? '0' : themeCssVariables.spacing[4])};
  min-height: ${themeCssVariables.spacing[10]};
  padding-right: ${themeCssVariables.spacing[2]};
  transition: gap calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
  user-select: none;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-left: ${themeCssVariables.spacing[5]};
    padding-right: ${themeCssVariables.spacing[5]};
  }
`;

const StyledSearchButtonContainer = styled.div<{ isExpanded: boolean }>`
  display: flex;

  > button {
    height: ${({ isExpanded }) =>
      isExpanded ? themeCssVariables.spacing[6] : themeCssVariables.spacing[8]};
    width: ${({ isExpanded }) =>
      isExpanded ? themeCssVariables.spacing[6] : themeCssVariables.spacing[8]};
  }
`;

const StyledRightActions = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  align-self: ${({ isExpanded }) => (isExpanded ? 'auto' : 'flex-end')};
  display: flex;
  flex-direction: ${({ isExpanded }) => (isExpanded ? 'row' : 'column')};
  flex-shrink: 0;
  gap: ${({ isExpanded }) =>
    isExpanded ? '2px' : themeCssVariables.spacing[1]};
  margin-left: ${({ isExpanded }) => (isExpanded ? 'auto' : '0')};
  transition: gap calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
`;

const StyledNavigationDrawerCollapseButtonContainer = styled.div`
  > * {
    height: ${themeCssVariables.spacing[6]};
    padding-right: 0;
    width: ${themeCssVariables.spacing[6]};
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    > * {
      height: ${themeCssVariables.spacing[8]};
      padding-right: 0;
      width: ${themeCssVariables.spacing[8]};
    }
  }
`;

const StyledWorkspaceDropdownContainer = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 1 1 auto;
  min-height: ${themeCssVariables.spacing[10]};
  min-width: 0;
  position: relative;

  &::after {
    border-bottom: 1px solid ${themeCssVariables.border.color.medium};
    bottom: calc(-1 * ${themeCssVariables.spacing[1]});
    content: '';
    display: ${({ isExpanded }) => (isExpanded ? 'none' : 'block')};
    left: calc(-1 * ${themeCssVariables.spacing[2]});
    pointer-events: none;
    position: absolute;
    right: calc(-1 * ${themeCssVariables.spacing[2]});
  }
`;

type NavigationDrawerHeaderProps = {
  showCollapseButton: boolean;
};

export const NavigationDrawerHeader = ({
  showCollapseButton,
}: NavigationDrawerHeaderProps) => {
  const isMobile = useIsMobile();
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();
  const isExpanded = useIsNavigationDrawerContentExpanded();

  return (
    <StyledContainer isExpanded={isExpanded}>
      <StyledWorkspaceDropdownContainer isExpanded={isExpanded}>
        <MultiWorkspaceDropdownButton />
      </StyledWorkspaceDropdownContainer>
      <StyledRightActions isExpanded={isExpanded}>
        {!isMobile && (
          <StyledSearchButtonContainer isExpanded={isExpanded}>
            <LightIconButton
              Icon={IconSearch}
              accent="secondary"
              size="small"
              onClick={openRecordsSearchPage}
              aria-label={t`Search`}
            />
          </StyledSearchButtonContainer>
        )}
        {isExpanded && showCollapseButton && (
          <StyledNavigationDrawerCollapseButtonContainer>
            <NavigationDrawerCollapseButton direction="left" />
          </StyledNavigationDrawerCollapseButtonContainer>
        )}
      </StyledRightActions>
    </StyledContainer>
  );
};
