import {
  IconChevronLeft,
  IconLayoutNavbar,
  IconLayoutSidebarRight,
  MenuItemSelect,
} from 'twenty-ui';

import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useState } from 'react';

export type OpenInType = 'sidebar' | 'record-page';

export const ObjectOptionsDropdownViewSettingsOpenInContent = () => {
  const { resetContent } = useOptionsDropdown();
  const [openIn, setOpenIn] = useState<OpenInType>('sidebar');

  return (
    <>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetContent}>
        Open in
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <MenuItemSelect
          LeftIcon={IconLayoutSidebarRight}
          text="Sidebar"
          selected={openIn === 'sidebar'}
          onClick={() => setOpenIn('sidebar')}
        />
        <MenuItemSelect
          LeftIcon={IconLayoutNavbar}
          text="Record Page"
          selected={openIn === 'record-page'}
          onClick={() => setOpenIn('record-page')}
        />
      </DropdownMenuItemsContainer>
    </>
  );
};
