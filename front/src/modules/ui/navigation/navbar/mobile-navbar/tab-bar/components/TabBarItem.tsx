import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import {
  IconCheckbox,
  IconList,
  IconSearch,
  IconSettings,
} from '@/ui/display/icon';

const StyledIconContainer = styled.div<{ isActive?: boolean }>`
  align-items: center;
  aspect-ratio: 1/1;
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.background.tertiary : theme.background.transparent};
  border-radius: ${({ theme }) => theme.spacing(1)};
  display: flex;
  justify-content: center;
  width: ${({ theme }) => theme.icon.size.xl}px;
`;

export type IconT = 'tab' | 'search' | 'tasks' | 'settings';

type TabBarItemProps = {
  icon: IconT;
  isActive: boolean;
  onClick: () => void;
};

export const TabBarItem = ({ icon, isActive, onClick }: TabBarItemProps) => {
  const theme = useTheme();

  return (
    <StyledIconContainer isActive={isActive} onClick={onClick}>
      {icon === 'tab' && <IconList color={theme.color.gray50} />}
      {icon === 'search' && <IconSearch color={theme.color.gray50} />}
      {icon === 'tasks' && <IconCheckbox color={theme.color.gray50} />}
      {icon === 'settings' && <IconSettings color={theme.color.gray50} />}
    </StyledIconContainer>
  );
};
