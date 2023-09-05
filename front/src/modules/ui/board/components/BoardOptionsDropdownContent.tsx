import { useState } from 'react';
import { useTheme } from '@emotion/react';

import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { IconChevronLeft } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';

type BoardOptionsDropdownMenu = 'options' | 'fields';

export function BoardOptionsDropdownContent() {
  const theme = useTheme();

  const [menuShown, setMenuShown] =
    useState<BoardOptionsDropdownMenu>('options');

  function handleFieldsClick() {
    setMenuShown('fields');
  }

  function handleMenuHeaderClick() {
    setMenuShown('options');
  }

  return (
    <StyledDropdownMenu>
      {menuShown === 'options' ? (
        <>
          <DropdownMenuHeader>Options</DropdownMenuHeader>
          <StyledDropdownMenuSeparator />
          <StyledDropdownMenuItemsContainer>
            <MenuItem onClick={handleFieldsClick} text="Fields" />
          </StyledDropdownMenuItemsContainer>
        </>
      ) : (
        menuShown === 'fields' && (
          <>
            <DropdownMenuHeader
              StartIcon={IconChevronLeft}
              onClick={handleMenuHeaderClick}
            >
              Fields
            </DropdownMenuHeader>
            <StyledDropdownMenuSeparator />
            {}
          </>
        )
      )}
    </StyledDropdownMenu>
  );
}
