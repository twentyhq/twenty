import { useState } from 'react';
import { useTheme } from '@emotion/react';
import { IconChevronLeft } from '@tabler/icons-react';

import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';

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
            <DropdownMenuItem onClick={handleFieldsClick}>
              Fields
            </DropdownMenuItem>
          </StyledDropdownMenuItemsContainer>
        </>
      ) : menuShown === 'fields' ? (
        <>
          <DropdownMenuHeader
            startIcon={<IconChevronLeft size={theme.icon.size.md} />}
            onClick={handleMenuHeaderClick}
          >
            Fields
          </DropdownMenuHeader>
          <StyledDropdownMenuSeparator />
          {}
        </>
      ) : (
        <></>
      )}
    </StyledDropdownMenu>
  );
}
