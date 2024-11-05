import { SuggestionMenuProps } from '@blocknote/react';
import styled from '@emotion/styled';
import { IconComponent } from 'twenty-ui';

import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItemSuggestion } from '@/ui/navigation/menu-item/components/MenuItemSuggestion';

export type SuggestionItem = {
  title: string;
  onItemClick: () => void;
  aliases?: string[];
  Icon?: IconComponent;
};

type CustomSlashMenuProps = SuggestionMenuProps<SuggestionItem>;

const StyledSlashMenu = styled.div`
  * {
    box-sizing: content-box;
  }
`;

export const CustomSlashMenu = (props: CustomSlashMenuProps) => {
  return (
    <StyledSlashMenu>
      <DropdownMenu style={{ zIndex: 2001 }}>
        <DropdownMenuItemsContainer>
          {props.items.map((item, index) => (
            <MenuItemSuggestion
              key={item.title}
              onClick={() => item.onItemClick()}
              text={item.title}
              LeftIcon={item.Icon}
              selected={props.selectedIndex === index}
            />
          ))}
        </DropdownMenuItemsContainer>
      </DropdownMenu>
    </StyledSlashMenu>
  );
};
