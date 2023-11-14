import styled from '@emotion/styled';

import { TabBarItem } from '@/ui/navigation/navbar/mobile-navbar/tab-bar/components/TabBarItem';
import { useTabBar } from '@/ui/navigation/navbar/mobile-navbar/tab-bar/hooks/useTabBar';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

const StyledContainer = styled.div<{
  isMobile: boolean;
}>`
  bottom: ${({ theme }) => theme.spacing(4)};
  display: ${({ isMobile }) => (isMobile ? 'flex' : 'none')};
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  position: fixed;
  width: 100%;
`;

type IconT = 'tab' | 'search' | 'tasks' | 'settings';

const TabBar = () => {
  const isMobile = useIsMobile();
  const { activeIcon, handleTabClick } = useTabBar();
  type Tab = {
    id: number;
    iconType: IconT;
  };

  const tabs: Tab[] = [
    { id: 0, iconType: 'tab' },
    { id: 1, iconType: 'search' },
    { id: 2, iconType: 'tasks' },
    { id: 3, iconType: 'settings' },
  ];
  return (
    <StyledContainer isMobile={isMobile}>
      {tabs.map(({ id, iconType }) => (
        <TabBarItem
          key={id}
          icon={iconType}
          isActive={activeIcon === iconType}
          onClick={() => handleTabClick(iconType)}
        />
      ))}
    </StyledContainer>
  );
};

export default TabBar;
