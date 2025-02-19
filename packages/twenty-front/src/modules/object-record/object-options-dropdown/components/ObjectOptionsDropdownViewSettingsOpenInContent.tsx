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

export type OpenInType = 'side-panel' | 'record-page';

export const ObjectOptionsDropdownViewSettingsOpenInContent = () => {
  const { resetContent } = useOptionsDropdown();
  const [openIn, setOpenIn] = useState<OpenInType>('side-panel');

  return (
    <>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetContent}>
        Open in
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <MenuItemSelect
          LeftIcon={IconLayoutSidebarRight}
          text="Side Panel"
          selected={openIn === 'side-panel'}
          onClick={() => setOpenIn('side-panel')}
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
