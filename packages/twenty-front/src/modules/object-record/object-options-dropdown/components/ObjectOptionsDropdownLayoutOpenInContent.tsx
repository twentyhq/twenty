import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { useUpdateObjectViewOptions } from '@/object-record/object-options-dropdown/hooks/useUpdateObjectViewOptions';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import {
  IconChevronLeft,
  IconLayoutNavbar,
  IconLayoutSidebarRight,
} from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

export const ObjectOptionsDropdownLayoutOpenInContent = () => {
  const { onContentChange } = useOptionsDropdown();
  const recordIndexOpenRecordIn = useRecoilValue(recordIndexOpenRecordInState);
  const { currentView } = useGetCurrentViewOnly();
  const { setAndPersistOpenRecordIn } = useUpdateObjectViewOptions();

  return (
    <>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => onContentChange('layout')}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Open in`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <MenuItemSelect
          LeftIcon={IconLayoutSidebarRight}
          text={t`Side Panel`}
          selected={recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL}
          onClick={() =>
            setAndPersistOpenRecordIn(
              ViewOpenRecordInType.SIDE_PANEL,
              currentView,
            )
          }
        />
        <MenuItemSelect
          LeftIcon={IconLayoutNavbar}
          text={t`Record Page`}
          selected={
            recordIndexOpenRecordIn === ViewOpenRecordInType.RECORD_PAGE
          }
          onClick={() =>
            setAndPersistOpenRecordIn(
              ViewOpenRecordInType.RECORD_PAGE,
              currentView,
            )
          }
        />
      </DropdownMenuItemsContainer>
    </>
  );
};
