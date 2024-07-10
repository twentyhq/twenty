import styled from '@emotion/styled';
import { IconComponent } from 'twenty-ui';

import { NavigationBarItem } from './NavigationBarItem';

const StyledContainer = styled.div`
  background-color: ${({ theme }) => theme.background.tertiary};
  bottom: 0;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  left: 0;
  padding: ${({ theme }) => theme.spacing(3)};
  position: fixed;
  right: 0;
  z-index: 1001;
`;

type NavigationBarProps = {
  activeItemName: string;
  items: { name: string; Icon: IconComponent; onClick: () => void }[];
};

export const NavigationBar = ({
  activeItemName,
  items,
}: NavigationBarProps) => (
  <StyledContainer>
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
