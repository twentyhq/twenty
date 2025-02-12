import { SuggestionMenuProps } from '@blocknote/react';
import styled from '@emotion/styled';
import { IconComponent, MenuItemSuggestion } from 'twenty-ui';

import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useFloating } from '@floating-ui/react';
import { createPortal } from 'react-dom';

export type SuggestionItem = {
  title: string;
  onItemClick: () => void;
  aliases?: string[];
  Icon?: IconComponent;
};

type CustomSlashMenuProps = SuggestionMenuProps<SuggestionItem>;

const StyledContainer = styled.div`
  height: 1px;
  width: 1px;
`;

const StyledInnerContainer = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  height: 250px;
  width: 100%;
`;

export const CustomSlashMenu = (props: CustomSlashMenuProps) => {
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
  });

  return (
    <StyledContainer ref={refs.setReference}>
      {createPortal(
        <OverlayContainer ref={refs.setFloating} style={floatingStyles}>
          <StyledInnerContainer>
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
          </StyledInnerContainer>
        </OverlayContainer>,
        document.body,
      )}
    </StyledContainer>
  );
};
