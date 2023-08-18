import { useState } from 'react';
import { useTheme } from '@emotion/react';
import { IconChevronLeft } from '@tabler/icons-react';

import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/dropdown/components/DropdownMenuSeparator';

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
    <DropdownMenu>
      {menuShown === 'options' ? (
        <>
          <DropdownMenuHeader>Options</DropdownMenuHeader>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            <DropdownMenuItem onClick={handleFieldsClick}>
              Fields
            </DropdownMenuItem>
          </DropdownMenuItemsContainer>
        </>
      ) : menuShown === 'fields' ? (
        <>
          <DropdownMenuHeader
            startIcon={<IconChevronLeft size={theme.icon.size.md} />}
            onClick={handleMenuHeaderClick}
          >
            Fields
          </DropdownMenuHeader>
          <DropdownMenuSeparator />
          {}
        </>
      ) : (
        <></>
      )}
    </DropdownMenu>
  );
}
