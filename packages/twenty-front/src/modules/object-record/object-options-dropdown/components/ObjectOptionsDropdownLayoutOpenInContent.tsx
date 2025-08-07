import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useUpdateObjectViewOptions } from '@/object-record/object-options-dropdown/hooks/useUpdateObjectViewOptions';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { canOpenObjectInSidePanel } from '@/object-record/utils/canOpenObjectInSidePanel';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
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
  const { onContentChange } = useObjectOptionsDropdown();
  const recordIndexOpenRecordIn = useRecoilValue(recordIndexOpenRecordInState);
  const { currentView } = useGetCurrentViewOnly();
  const { setAndPersistOpenRecordIn } = useUpdateObjectViewOptions();
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const canOpenInSidePanel = canOpenObjectInSidePanel(
    objectMetadataItem.nameSingular,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    OBJECT_OPTIONS_DROPDOWN_ID,
  );

  const selectableItemIdArray = [
    ViewOpenRecordInType.SIDE_PANEL,
    ViewOpenRecordInType.RECORD_PAGE,
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
            itemId={ViewOpenRecordInType.SIDE_PANEL}
            onEnter={() => {
              if (!canOpenInSidePanel) {
                return;
              }
              setAndPersistOpenRecordIn(
                ViewOpenRecordInType.SIDE_PANEL,
                currentView,
              );
            }}
          >
            <MenuItemSelect
              LeftIcon={IconLayoutSidebarRight}
              text={t`Side Panel`}
              selected={
                recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL
              }
              focused={selectedItemId === ViewOpenRecordInType.SIDE_PANEL}
              onClick={() => {
                if (!canOpenInSidePanel) {
                  return;
                }

                setAndPersistOpenRecordIn(
                  ViewOpenRecordInType.SIDE_PANEL,
                  currentView,
                );
              }}
              disabled={!canOpenInSidePanel}
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
    </DropdownContent>
  );
};
