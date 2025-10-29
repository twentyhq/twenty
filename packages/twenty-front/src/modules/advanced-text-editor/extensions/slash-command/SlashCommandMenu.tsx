import { ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled';
import { type FC } from 'react';
import { THEME_DARK, THEME_LIGHT } from 'twenty-ui/theme';
import { type SlashCommandItem } from './SlashCommand';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  min-width: 320px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledItemsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(1)};

  /* Custom scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.border.color.medium} transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border.color.medium};
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
`;

const StyledMenuItem = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(1.5)}`};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  transition: background-color 0.1s ease;
  user-select: none;

  background: ${({ theme, isSelected }) =>
    isSelected ? theme.background.transparent.light : 'transparent'};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }

  &:active {
    background: ${({ theme }) => theme.background.transparent.medium};
  }

  &:hover .slash-command-icon {
    background: ${({ theme }) => theme.background.transparent.medium};
  }
`;

const StyledIconContainer = styled.div<{ isSelected: boolean }>`
  align-items: center;
  background: ${({ theme, isSelected }) =>
    isSelected
      ? theme.background.transparent.medium
      : theme.background.transparent.lighter};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  height: 32px;
  justify-content: center;
  min-width: 32px;
  transition: all 0.1s ease;
  width: 32px;
`;

const StyledTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  flex: 1;
  min-width: 0;
`;

const StyledTitle = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
  line-height: 1.2;
`;

const StyledDescription = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
        <StyledItemsList>
          {items.map((item, index) => {
            const Icon = item.icon;
            const isSelected = index === selectedIndex;

            return (
              <StyledMenuItem
                key={item.id}
                isSelected={isSelected}
                onClick={() => onSelect(item)}
                onMouseEnter={(e) => {
                  // Prevent hover effect from interfering with keyboard navigation
                  e.currentTarget.style.pointerEvents = 'auto';
                }}
              >
                <StyledIconContainer
                  className="slash-command-icon"
                  isSelected={isSelected}
                >
                  {Icon && <Icon size={theme.icon.size.sm} />}
                </StyledIconContainer>
                <StyledTextContainer>
                  <StyledTitle>{item.title}</StyledTitle>
                  {item.description && (
                    <StyledDescription>{item.description}</StyledDescription>
                  )}
                </StyledTextContainer>
              </StyledMenuItem>
            );
          })}
        </StyledItemsList>
      </StyledContainer>
    </ThemeProvider>
  );
};

export default SlashCommandMenu;
