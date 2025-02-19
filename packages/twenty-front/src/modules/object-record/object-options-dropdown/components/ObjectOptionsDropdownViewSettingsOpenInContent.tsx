import {
  IconChevronLeft,
  IconLayoutNavbar,
  IconLayoutSidebarRight,
  MenuItemSelect,
} from 'twenty-ui';

import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useRecoilState } from 'recoil';

export const ObjectOptionsDropdownViewSettingsOpenInContent = () => {
  const { resetContent } = useOptionsDropdown();
  const [recordIndexOpenRecordIn, setRecordIndexOpenRecordIn] = useRecoilState(
    recordIndexOpenRecordInState,
  );

  return (
    <>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetContent}>
        Open in
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <MenuItemSelect
          LeftIcon={IconLayoutSidebarRight}
          text="Side Panel"
          selected={recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL}
          onClick={() =>
            setRecordIndexOpenRecordIn(ViewOpenRecordInType.SIDE_PANEL)
          }
        />
        <MenuItemSelect
          LeftIcon={IconLayoutNavbar}
          text="Record Page"
          selected={
            recordIndexOpenRecordIn === ViewOpenRecordInType.RECORD_PAGE
          }
          onClick={() =>
            setRecordIndexOpenRecordIn(ViewOpenRecordInType.RECORD_PAGE)
          }
        />
      </DropdownMenuItemsContainer>
    </>
  );
};
