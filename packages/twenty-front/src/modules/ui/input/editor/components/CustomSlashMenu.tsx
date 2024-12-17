import { SuggestionMenuProps } from '@blocknote/react';
import styled from '@emotion/styled';
import { IconComponent, MenuItemSuggestion } from 'twenty-ui';

import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';

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

  max-height: 200px;
`;

export const CustomSlashMenu = (props: CustomSlashMenuProps) => {
  return (
    <OverlayContainer>
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
    </OverlayContainer>
  );
};
