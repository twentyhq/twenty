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
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewOpenRecordIn } from '~/generated-metadata/graphql';
import { t } from '@lingui/core/macro';
import {
  IconChevronLeft,
  IconLayoutNavbar,
  IconLayoutSidebarRight,
} from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

export const ObjectOptionsDropdownLayoutOpenInContent = () => {
  const { onContentChange } = useObjectOptionsDropdown();
  const recordIndexOpenRecordIn = useAtomStateValue(
    recordIndexOpenRecordInState,
  );
  const { currentView } = useGetCurrentViewOnly();
  const { setAndPersistOpenRecordIn } = useUpdateObjectViewOptions();
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const canOpenInSidePanel = canOpenObjectInSidePanel(
    objectMetadataItem.nameSingular,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    OBJECT_OPTIONS_DROPDOWN_ID,
  );

  const selectableItemIdArray = [
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
            itemId={ViewOpenRecordIn.SIDE_PANEL}
            onEnter={() => {
              if (!canOpenInSidePanel) {
                return;
              }
              setAndPersistOpenRecordIn(
                ViewOpenRecordIn.SIDE_PANEL,
                currentView,
              );
            }}
          >
            <MenuItemSelect
              LeftIcon={IconLayoutSidebarRight}
              text={t`Side Panel`}
              selected={recordIndexOpenRecordIn === ViewOpenRecordIn.SIDE_PANEL}
              focused={selectedItemId === ViewOpenRecordIn.SIDE_PANEL}
              onClick={() => {
                if (!canOpenInSidePanel) {
                  return;
                }

                setAndPersistOpenRecordIn(
                  ViewOpenRecordIn.SIDE_PANEL,
                  currentView,
                );
              }}
              disabled={!canOpenInSidePanel}
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
                recordIndexOpenRecordIn === ViewOpenRecordIn.RECORD_PAGE
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
