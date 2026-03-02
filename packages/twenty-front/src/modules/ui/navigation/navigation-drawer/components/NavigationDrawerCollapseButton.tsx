import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import styled from '@emotion/styled';
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarRightCollapse,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

const StyledCollapseButton = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.light};
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

  return (
    <StyledCollapseButton className={className} onClick={handleClick}>
      <LightIconButton
        Icon={
          direction === 'left'
            ? IconLayoutSidebarLeftCollapse
            : IconLayoutSidebarRightCollapse
        }
        accent="secondary"
        size="small"
      />
    </StyledCollapseButton>
  );
};
