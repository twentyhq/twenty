import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCollapseButton = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.light};
  cursor: pointer;
  display: flex;
  justify-content: center;
  user-select: none;
`;

type NavigationDrawerCollapseButtonProps = {
  className?: string;
  direction?: 'left' | 'right';
};

export const NavigationDrawerCollapseButton = ({
  className,
  direction = 'left',
}: NavigationDrawerCollapseButtonProps) => {
  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useAtomState(isNavigationDrawerExpandedState);
  const setNavigationDrawerActiveTab = useSetAtomState(
    navigationDrawerActiveTabState,
  );

  const handleClick = () => {
    if (isNavigationDrawerExpanded) {
      setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
    }
    setIsNavigationDrawerExpanded((previousIsExpanded) => !previousIsExpanded);
  };

  const Icon =
    direction === 'left'
      ? isNavigationDrawerExpanded
        ? IconLayoutSidebarLeftCollapse
        : IconLayoutSidebarLeftExpand
      : isNavigationDrawerExpanded
        ? IconLayoutSidebarRightCollapse
        : IconLayoutSidebarRightExpand;

  return (
    <StyledCollapseButton className={className}>
      <LightIconButton
        Icon={Icon}
        accent="secondary"
        aria-label={
          isNavigationDrawerExpanded ? t`Collapse sidebar` : t`Expand sidebar`
        }
        onClick={handleClick}
        size="small"
      />
    </StyledCollapseButton>
  );
};
