import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { useUpdateObjectViewOptions } from '@/object-record/object-options-dropdown/hooks/useUpdateObjectViewOptions';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
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

  const selectedItemId = useRecoilComponentValueV2(
    selectedItemIdComponentState,
    OBJECT_OPTIONS_DROPDOWN_ID,
  );

  const selectableItemIdArray = [
    ViewOpenRecordInType.SIDE_PANEL,
    ViewOpenRecordInType.RECORD_PAGE,
  ];

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
        <SelectableList
          selectableListInstanceId={OBJECT_OPTIONS_DROPDOWN_ID}
          hotkeyScope={TableOptionsHotkeyScope.Dropdown}
          selectableItemIdArray={selectableItemIdArray}
        >
          <SelectableListItem
            itemId={ViewOpenRecordInType.SIDE_PANEL}
            onEnter={() =>
              setAndPersistOpenRecordIn(
                ViewOpenRecordInType.SIDE_PANEL,
                currentView,
              )
            }
          >
            <MenuItemSelect
              LeftIcon={IconLayoutSidebarRight}
              text={t`Side Panel`}
              selected={
                recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL
              }
              focused={selectedItemId === ViewOpenRecordInType.SIDE_PANEL}
              onClick={() =>
                setAndPersistOpenRecordIn(
                  ViewOpenRecordInType.SIDE_PANEL,
                  currentView,
                )
              }
            />
          </SelectableListItem>
          <SelectableListItem
            itemId={ViewOpenRecordInType.RECORD_PAGE}
            onEnter={() =>
              setAndPersistOpenRecordIn(
                ViewOpenRecordInType.RECORD_PAGE,
                currentView,
              )
            }
          >
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
              focused={selectedItemId === ViewOpenRecordInType.RECORD_PAGE}
            />
          </SelectableListItem>
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
