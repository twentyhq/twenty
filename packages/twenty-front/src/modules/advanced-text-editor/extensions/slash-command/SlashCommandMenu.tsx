import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled';
import { type FC } from 'react';
import { MenuItemSuggestion } from 'twenty-ui/navigation';
import { THEME_DARK, THEME_LIGHT } from 'twenty-ui/theme';
import { type SlashCommandItem } from './SlashCommand';

const StyledDropdownWrapper = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  overflow: hidden;
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
      <StyledDropdownWrapper>
        <DropdownContent>
          <DropdownMenuItemsContainer hasMaxHeight>
            {items.map((item, index) => {
              const isSelected = index === selectedIndex;

              return (
                <MenuItemSuggestion
                  key={item.id}
                  LeftIcon={item.icon}
                  text={item.title}
                  selected={isSelected}
                  onClick={() => onSelect(item)}
                />
              );
            })}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      </StyledDropdownWrapper>
    </ThemeProvider>
  );
};

export default SlashCommandMenu;
