import { navigationDrawerHeightState } from '@/ui/navigation/states/navigationDrawerHeightState';
import styled from '@emotion/styled';
import { useEffect, useRef } from 'react';
import { useSetRecoilState } from 'recoil';
import { IconComponent, isDefined } from 'twenty-ui';
import { NavigationBarItem } from './NavigationBarItem';

const StyledContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(3)};
  z-index: 1001;
`;

type NavigationBarProps = {
  activeItemName: string;
  items: { name: string; Icon: IconComponent; onClick: () => void }[];
};

export const NavigationBar = ({
  activeItemName,
  items,
}: NavigationBarProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const setNavigationBarHeight = useSetRecoilState(navigationDrawerHeightState);

  useEffect(() => {
    if (isDefined(containerRef.current)) {
      const newHeight = containerRef.current.offsetHeight;
      setNavigationBarHeight(newHeight);
    }
  }, [setNavigationBarHeight]);

  return (
    <StyledContainer ref={containerRef}>
      {items.map(({ Icon, name, onClick }) => (
        <NavigationBarItem
          key={name}
          Icon={Icon}
          isActive={activeItemName === name}
          onClick={onClick}
        />
      ))}
    </StyledContainer>
  );
};
