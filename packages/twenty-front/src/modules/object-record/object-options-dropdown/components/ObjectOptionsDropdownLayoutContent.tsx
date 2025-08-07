import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { useSetViewTypeFromLayoutOptionsMenu } from '@/object-record/object-options-dropdown/hooks/useSetViewTypeFromLayoutOptionsMenu';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { ViewType, viewTypeIconMapping } from '@/views/types/ViewType';
import { useGetAvailableFieldsForKanban } from '@/views/view-picker/hooks/useGetAvailableFieldsForKanban';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBaselineDensitySmall,
  IconChevronLeft,
  IconLayoutList,
  IconLayoutNavbar,
  IconLayoutSidebarRight,
  IconTable,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { MenuItem, MenuItemSelect, MenuItemToggle } from 'twenty-ui/navigation';

export const ObjectOptionsDropdownLayoutContent = () => {
  const { t } = useLingui();
  const { currentView } = useGetCurrentViewOnly();

  const {
    recordIndexId,
    objectMetadataItem,
    resetContent,
    onContentChange,
    dropdownId,
  } = useObjectOptionsDropdown();

  const { isCompactModeActive, setAndPersistIsCompactModeActive } =
    useObjectOptionsForBoard({
      objectNameSingular: objectMetadataItem.nameSingular,
      recordBoardId: recordIndexId,
      viewBarId: recordIndexId,
    });

  const recordIndexOpenRecordIn = useRecoilValue(recordIndexOpenRecordInState);

  const recordGroupFieldMetadata = useRecoilComponentValue(
    recordGroupFieldMetadataComponentState,
  );

  const { setAndPersistViewType } = useSetViewTypeFromLayoutOptionsMenu();
  const { availableFieldsForKanban, navigateToSelectSettings } =
    useGetAvailableFieldsForKanban();

  const { closeDropdown } = useCloseDropdown();

  const handleSelectKanbanViewType = async () => {
    if (isDefaultView) {
      return;
    }
    if (availableFieldsForKanban.length === 0) {
      navigateToSelectSettings();
      closeDropdown(dropdownId);
    }
    if (currentView?.type !== ViewType.Kanban) {
      await setAndPersistViewType(ViewType.Kanban);
    }
  };

  const isDefaultView = currentView?.key === 'INDEX';
  const nbsp = '\u00A0';

  const selectableItemIdArray = [
    ViewType.Table,
    ...(isDefaultView ? [] : [ViewType.Kanban]),
    ViewOpenRecordInType.SIDE_PANEL,
    ...(currentView?.type === ViewType.Kanban ? ['Group', 'Compact view'] : []),
  ];

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    OBJECT_OPTIONS_DROPDOWN_ID,
  );

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={resetContent}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Layout`}
      </DropdownMenuHeader>

      {!!currentView && (
        <SelectableList
          selectableListInstanceId={OBJECT_OPTIONS_DROPDOWN_ID}
          focusId={OBJECT_OPTIONS_DROPDOWN_ID}
          selectableItemIdArray={selectableItemIdArray}
        >
          <DropdownMenuItemsContainer scrollable={false}>
            <SelectableListItem
              itemId={ViewType.Table}
              onEnter={() => {
                setAndPersistViewType(ViewType.Table);
              }}
            >
              <MenuItemSelect
                LeftIcon={IconTable}
                text={t`Table`}
                selected={currentView?.type === ViewType.Table}
                focused={selectedItemId === ViewType.Table}
                onClick={async () => {
                  if (currentView?.type !== ViewType.Table) {
                    await setAndPersistViewType(ViewType.Table);
                  }
                }}
              />
            </SelectableListItem>
            <SelectableListItem
              itemId={ViewType.Kanban}
              onEnter={() => {
                setAndPersistViewType(ViewType.Kanban);
              }}
            >
              <MenuItemSelect
                LeftIcon={viewTypeIconMapping(ViewType.Kanban)}
                text={t`Kanban`}
                disabled={isDefaultView}
                focused={selectedItemId === ViewType.Kanban}
                contextualText={
                  isDefaultView ? (
                    <>
                      {nbsp}·{nbsp}
                      <OverflowingTextWithTooltip
                        text={t`Not available for default view`}
                      />
                    </>
                  ) : availableFieldsForKanban.length === 0 ? (
                    t`Create Select...`
                  ) : undefined
                }
                selected={currentView?.type === ViewType.Kanban}
                onClick={handleSelectKanbanViewType}
              />
            </SelectableListItem>
          </DropdownMenuItemsContainer>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer scrollable={false}>
            <SelectableListItem
              itemId={ViewOpenRecordInType.SIDE_PANEL}
              onEnter={() => {
                onContentChange('layoutOpenIn');
              }}
            >
              <MenuItem
                focused={selectedItemId === ViewOpenRecordInType.SIDE_PANEL}
                LeftIcon={
                  recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL
                    ? IconLayoutSidebarRight
                    : IconLayoutNavbar
                }
                text={t`Open in`}
                onClick={() => {
                  onContentChange('layoutOpenIn');
                }}
                contextualText={
                  recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL
                    ? t`Side Panel`
                    : t`Record Page`
                }
                hasSubMenu
              />
            </SelectableListItem>
            {currentView?.type === ViewType.Kanban && (
              <>
                <SelectableListItem
                  itemId={'Group'}
                  onEnter={() => {
                    isDefined(recordGroupFieldMetadata)
                      ? onContentChange('recordGroups')
                      : onContentChange('recordGroupFields');
                  }}
                >
                  <MenuItem
                    focused={selectedItemId === 'Group'}
                    onClick={() =>
                      isDefined(recordGroupFieldMetadata)
                        ? onContentChange('recordGroups')
                        : onContentChange('recordGroupFields')
                    }
                    LeftIcon={IconLayoutList}
                    text={t`Group`}
                    contextualText={recordGroupFieldMetadata?.label}
                    hasSubMenu
                  />
                </SelectableListItem>

                <SelectableListItem
                  itemId={'Compact view'}
                  onEnter={() => {
                    setAndPersistIsCompactModeActive(
                      !isCompactModeActive,
                      currentView,
                    );
                  }}
                >
                  <MenuItemToggle
                    focused={selectedItemId === 'Compact view'}
                    LeftIcon={IconBaselineDensitySmall}
                    onToggleChange={() =>
                      setAndPersistIsCompactModeActive(
                        !isCompactModeActive,
                        currentView,
                      )
                    }
                    toggled={isCompactModeActive}
                    text={t`Compact view`}
                    toggleSize="small"
                  />
                </SelectableListItem>
              </>
            )}
          </DropdownMenuItemsContainer>
        </SelectableList>
      )}
    </DropdownContent>
  );
};
