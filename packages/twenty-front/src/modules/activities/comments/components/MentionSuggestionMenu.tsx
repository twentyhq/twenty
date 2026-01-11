import {
  type DefaultReactSuggestionItem,
  type SuggestionMenuProps,
} from '@blocknote/react';
import styled from '@emotion/styled';

import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItemAvatar } from 'twenty-ui/navigation';

const StyledContainer = styled.div`
  position: relative;
`;

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
`;

const StyledSelectedItem = styled.div`
  background-color: ${({ theme }) => theme.background.transparent.light};
`;

export type MentionSuggestionItem = DefaultReactSuggestionItem & {
  id: string;
  avatarUrl?: string | null;
};

export const MentionSuggestionMenu = (
  props: SuggestionMenuProps<MentionSuggestionItem>,
) => {
  const { items, selectedIndex, onItemClick } = props;

  if (items.length === 0) {
    return (
      <StyledContainer>
        <DropdownContent>
          <StyledEmptyState>No members found</StyledEmptyState>
        </DropdownContent>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <DropdownContent>
        <DropdownMenuItemsContainer hasMaxHeight>
          {items.map((item, index) => {
            const isSelected = index === selectedIndex;
            const menuItem = (
              <MenuItemAvatar
                key={item.id}
                onClick={() => onItemClick?.(item)}
                text={item.title}
                avatar={{
                  avatarUrl: item.avatarUrl ?? undefined,
                  placeholderColorSeed: item.id,
                  placeholder: item.title,
                  size: 'md',
                  type: 'rounded',
                }}
              />
            );

            if (isSelected) {
              return (
                <StyledSelectedItem key={item.id}>{menuItem}</StyledSelectedItem>
              );
            }

            return menuItem;
          })}
        </DropdownMenuItemsContainer>
      </DropdownContent>
    </StyledContainer>
  );
};
