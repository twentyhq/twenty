import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useUpdateObjectViewOptions } from '@/object-record/object-options-dropdown/hooks/useUpdateObjectViewOptions';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewOpenRecordIn } from '~/generated-metadata/graphql';
import { t } from '@lingui/core/macro';
import {
  IconChevronLeft,
  IconLayoutNavbar,
  IconLayoutSidebarRight,
  IconUserCog,
} from 'twenty-ui/icon';
import { MenuItemSelect } from 'twenty-ui/navigation';

export const ObjectOptionsDropdownLayoutOpenInContent = () => {
  const { onContentChange } = useObjectOptionsDropdown();
  const { currentView } = useGetCurrentViewOnly();
  const { setAndPersistOpenRecordIn } = useUpdateObjectViewOptions();

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    OBJECT_OPTIONS_DROPDOWN_ID,
  );

  const selectableItemIdArray = [
    ViewOpenRecordIn.USER_PREFERENCE,
    ViewOpenRecordIn.SIDE_PANEL,
    ViewOpenRecordIn.RECORD_PAGE,
  ];

  return (
    <DropdownContent>
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
          focusId={OBJECT_OPTIONS_DROPDOWN_ID}
          selectableItemIdArray={selectableItemIdArray}
        >
          <SelectableListItem
            itemId={ViewOpenRecordIn.USER_PREFERENCE}
            onEnter={() => {
              setAndPersistOpenRecordIn(
                ViewOpenRecordIn.USER_PREFERENCE,
                currentView,
              );
            }}
          >
            <MenuItemSelect
              LeftIcon={IconUserCog}
              text={t`My preference`}
              selected={
                currentView?.openRecordIn === ViewOpenRecordIn.USER_PREFERENCE
              }
              focused={selectedItemId === ViewOpenRecordIn.USER_PREFERENCE}
              onClick={() => {
                setAndPersistOpenRecordIn(
                  ViewOpenRecordIn.USER_PREFERENCE,
                  currentView,
                );
              }}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId={ViewOpenRecordIn.SIDE_PANEL}
            onEnter={() => {
              setAndPersistOpenRecordIn(
                ViewOpenRecordIn.SIDE_PANEL,
                currentView,
              );
            }}
          >
            <MenuItemSelect
              LeftIcon={IconLayoutSidebarRight}
              text={t`Side Panel`}
              selected={
                currentView?.openRecordIn === ViewOpenRecordIn.SIDE_PANEL
              }
              focused={selectedItemId === ViewOpenRecordIn.SIDE_PANEL}
              onClick={() => {
                setAndPersistOpenRecordIn(
                  ViewOpenRecordIn.SIDE_PANEL,
                  currentView,
                );
              }}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId={ViewOpenRecordIn.RECORD_PAGE}
            onEnter={() =>
              setAndPersistOpenRecordIn(
                ViewOpenRecordIn.RECORD_PAGE,
                currentView,
              )
            }
          >
            <MenuItemSelect
              LeftIcon={IconLayoutNavbar}
              text={t`Record Page`}
              selected={
                currentView?.openRecordIn === ViewOpenRecordIn.RECORD_PAGE
              }
              onClick={() =>
                setAndPersistOpenRecordIn(
                  ViewOpenRecordIn.RECORD_PAGE,
                  currentView,
                )
              }
              focused={selectedItemId === ViewOpenRecordIn.RECORD_PAGE}
            />
          </SelectableListItem>
        </SelectableList>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
