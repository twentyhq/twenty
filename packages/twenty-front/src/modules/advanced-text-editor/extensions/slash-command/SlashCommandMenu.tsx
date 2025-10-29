import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled';
import { type FC } from 'react';
import { MenuItem } from 'twenty-ui/navigation';
import { THEME_DARK, THEME_LIGHT } from 'twenty-ui/theme';
import { type SlashCommandItem } from './SlashCommand';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  min-width: 240px;
`;

type SlashCommandMenuProps = {
  items: SlashCommandItem[];
  selectedIndex: number;
  onSelect: (item: SlashCommandItem) => void;
};

export const SlashCommandMenu: FC<SlashCommandMenuProps> = ({
  items,
  selectedIndex,
  onSelect,
}) => {
  const colorScheme = document.documentElement.className.includes('dark')
    ? 'Dark'
    : 'Light';
  const theme = colorScheme === 'Dark' ? THEME_DARK : THEME_LIGHT;

  return (
    <ThemeProvider theme={theme}>
      <StyledContainer>
        <DropdownMenuItemsContainer>
          {items.map((item, index) => (
            <MenuItem
              key={item.id}
              text={item.title}
              focused={index === selectedIndex}
              onClick={() => onSelect(item)}
            />
          ))}
        </DropdownMenuItemsContainer>
      </StyledContainer>
    </ThemeProvider>
  );
};

export default SlashCommandMenu;
