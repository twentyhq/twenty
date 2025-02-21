import {
  IconChevronLeft,
  IconLayoutNavbar,
  IconLayoutSidebarRight,
  MenuItemSelect,
} from 'twenty-ui';

import { useObjectOptions } from '@/object-record/object-options-dropdown/hooks/useObjectOptions';
import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';

export const ObjectOptionsDropdownViewSettingsOpenInContent = () => {
  const { onContentChange } = useOptionsDropdown();
  const recordIndexOpenRecordIn = useRecoilValue(recordIndexOpenRecordInState);
  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();
  const { setAndPersistOpenRecordIn } = useObjectOptions();

  return (
    <>
      <DropdownMenuHeader
        StartIcon={IconChevronLeft}
        onClick={() => onContentChange('viewSettings')}
      >
        {t`Open in`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <MenuItemSelect
          LeftIcon={IconLayoutSidebarRight}
          text="Side Panel"
          selected={recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL}
          onClick={() =>
            setAndPersistOpenRecordIn(
              ViewOpenRecordInType.SIDE_PANEL,
              currentViewWithCombinedFiltersAndSorts,
            )
          }
        />
        <MenuItemSelect
          LeftIcon={IconLayoutNavbar}
          text="Record Page"
          selected={
            recordIndexOpenRecordIn === ViewOpenRecordInType.RECORD_PAGE
          }
          onClick={() =>
            setAndPersistOpenRecordIn(
              ViewOpenRecordInType.RECORD_PAGE,
              currentViewWithCombinedFiltersAndSorts,
            )
          }
        />
      </DropdownMenuItemsContainer>
    </>
  );
};
