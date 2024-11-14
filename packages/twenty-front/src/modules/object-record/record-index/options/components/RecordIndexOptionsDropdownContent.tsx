import { useEffect, useState } from 'react';
import { Key } from 'ts-key-enum';
import {
  IconBaselineDensitySmall,
  IconChevronLeft,
  IconEyeOff,
  IconFileExport,
  IconFileImport,
  IconRotate2,
  IconSettings,
  IconTag,
  MenuItem,
  MenuItemNavigate,
  MenuItemToggle,
  UndecoratedLink,
  useIcons,
} from 'twenty-ui';

import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { RECORD_INDEX_OPTIONS_DROPDOWN_ID } from '@/object-record/record-index/options/constants/RecordIndexOptionsDropdownId';

import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecordGroupReorder } from '@/object-record/record-group/hooks/useRecordGroupReorder';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { useRecordGroups } from '@/object-record/record-group/hooks/useRecordGroups';
import {
  displayedExportProgress,
  useExportRecords,
} from '@/object-record/record-index/export/hooks/useExportRecords';
import { useRecordIndexOptionsForBoard } from '@/object-record/record-index/options/hooks/useRecordIndexOptionsForBoard';
import { useRecordIndexOptionsForTable } from '@/object-record/record-index/options/hooks/useRecordIndexOptionsForTable';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { useOpenObjectRecordsSpreasheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreasheetImportDialog';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewFieldsVisibilityDropdownSection } from '@/views/components/ViewFieldsVisibilityDropdownSection';
import { ViewGroupsVisibilityDropdownSection } from '@/views/components/ViewGroupsVisibilityDropdownSection';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { ViewType } from '@/views/types/ViewType';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

type RecordIndexOptionsMenu =
  | 'viewGroups'
  | 'hiddenViewGroups'
  | 'fields'
  | 'hiddenFields';

type RecordIndexOptionsDropdownContentProps = {
  recordIndexId: string;
  objectMetadataItem: ObjectMetadataItem;
  viewType: ViewType;
};

// TODO: Break this component down
export const RecordIndexOptionsDropdownContent = ({
  viewType,
  recordIndexId,
  objectMetadataItem,
}: RecordIndexOptionsDropdownContentProps) => {
  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const { getIcon } = useIcons();

  const { closeDropdown } = useDropdown(RECORD_INDEX_OPTIONS_DROPDOWN_ID);

  const [currentMenu, setCurrentMenu] = useState<
    RecordIndexOptionsMenu | undefined
  >(undefined);

  const resetMenu = () => setCurrentMenu(undefined);

  const handleSelectMenu = (option: RecordIndexOptionsMenu) => {
    setCurrentMenu(option);
  };

  const { objectNamePlural } = useObjectNamePluralFromSingular({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const settingsUrl = getSettingsPagePath(SettingsPath.ObjectDetail, {
    objectSlug: objectNamePlural,
  });

  useScopedHotkeys(
    [Key.Escape],
    () => {
      closeDropdown();
    },
    TableOptionsHotkeyScope.Dropdown,
  );

  const {
    handleColumnVisibilityChange,
    handleReorderColumns,
    visibleTableColumns,
    hiddenTableColumns,
  } = useRecordIndexOptionsForTable(recordIndexId);

  const { handleToggleTrashColumnFilter, toggleSoftDeleteFilterState } =
    useHandleToggleTrashColumnFilter({
      objectNameSingular: objectMetadataItem.nameSingular,
      viewBarId: recordIndexId,
    });

  const {
    visibleBoardFields,
    hiddenBoardFields,
    handleReorderBoardFields,
    handleBoardFieldVisibilityChange,
    isCompactModeActive,
    setAndPersistIsCompactModeActive,
  } = useRecordIndexOptionsForBoard({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const {
    hiddenRecordGroups,
    visibleRecordGroups,
    viewGroupFieldMetadataItem,
  } = useRecordGroups({
    objectNameSingular: objectMetadataItem.nameSingular,
  });
  const { handleVisibilityChange: handleRecordGroupVisibilityChange } =
    useRecordGroupVisibility({
      viewBarId: recordIndexId,
    });
  const { handleOrderChange: handleRecordGroupOrderChange } =
    useRecordGroupReorder({
      objectNameSingular: objectMetadataItem.nameSingular,
      viewBarId: recordIndexId,
    });

  const viewGroupSettingsUrl = getSettingsPagePath(SettingsPath.ObjectDetail, {
    id: viewGroupFieldMetadataItem?.name,
    objectSlug: objectNamePlural,
  });

  const visibleRecordFields =
    viewType === ViewType.Kanban ? visibleBoardFields : visibleTableColumns;

  const hiddenRecordFields =
    viewType === ViewType.Kanban ? hiddenBoardFields : hiddenTableColumns;

  const handleReorderFields =
    viewType === ViewType.Kanban
      ? handleReorderBoardFields
      : handleReorderColumns;

  const handleChangeFieldVisibility =
    viewType === ViewType.Kanban
      ? handleBoardFieldVisibilityChange
      : handleColumnVisibilityChange;

  const { openObjectRecordsSpreasheetImportDialog } =
    useOpenObjectRecordsSpreasheetImportDialog(objectMetadataItem.nameSingular);

  const { progress, download } = useExportRecords({
    delayMs: 100,
    filename: `${objectMetadataItem.nameSingular}.csv`,
    objectMetadataItem,
    recordIndexId,
    viewType,
  });

  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const isViewGroupMenuItemVisible =
    viewGroupFieldMetadataItem &&
    (visibleRecordGroups.length > 0 || hiddenRecordGroups.length > 0);

  const contextStoreNumberOfSelectedRecords = useRecoilComponentValueV2(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const mode = contextStoreNumberOfSelectedRecords > 0 ? 'selection' : 'all';

  useEffect(() => {
    if (currentMenu === 'hiddenViewGroups' && hiddenRecordGroups.length === 0) {
      setCurrentMenu('viewGroups');
    }
  }, [hiddenRecordGroups, currentMenu]);

  return (
    <>
      {!currentMenu && (
        <DropdownMenuItemsContainer>
          {isViewGroupMenuItemVisible && (
            <MenuItem
              onClick={() => handleSelectMenu('viewGroups')}
              LeftIcon={getIcon(currentViewWithCombinedFiltersAndSorts?.icon)}
              text={viewGroupFieldMetadataItem.label}
              hasSubMenu
            />
          )}
          <MenuItem
            onClick={() => handleSelectMenu('fields')}
            LeftIcon={IconTag}
            text="Fields"
            hasSubMenu
          />
          <MenuItem
            onClick={() => openObjectRecordsSpreasheetImportDialog()}
            LeftIcon={IconFileImport}
            text="Import"
          />
          <MenuItem
            onClick={download}
            LeftIcon={IconFileExport}
            text={displayedExportProgress(mode, progress)}
          />
          <MenuItem
            onClick={() => {
              handleToggleTrashColumnFilter();
              toggleSoftDeleteFilterState(true);
              closeDropdown();
            }}
            LeftIcon={IconRotate2}
            text={`Deleted ${objectNamePlural}`}
          />
        </DropdownMenuItemsContainer>
      )}
      {currentMenu === 'viewGroups' && (
        <>
          <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetMenu}>
            {viewGroupFieldMetadataItem?.label}
          </DropdownMenuHeader>
          <ViewGroupsVisibilityDropdownSection
            title={viewGroupFieldMetadataItem?.label ?? ''}
            viewGroups={visibleRecordGroups}
            onDragEnd={handleRecordGroupOrderChange}
            onVisibilityChange={handleRecordGroupVisibilityChange}
            isDraggable
            showSubheader={false}
            showDragGrip={true}
          />
          {hiddenRecordGroups.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItemsContainer>
                <MenuItemNavigate
                  onClick={() => handleSelectMenu('hiddenViewGroups')}
                  LeftIcon={IconEyeOff}
                  text={`Hidden ${viewGroupFieldMetadataItem?.label ?? ''}`}
                />
              </DropdownMenuItemsContainer>
            </>
          )}
        </>
      )}
      {currentMenu === 'fields' && (
        <>
          <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetMenu}>
            Fields
          </DropdownMenuHeader>
          <ScrollWrapper contextProviderName="dropdownMenuItemsContainer">
            <ViewFieldsVisibilityDropdownSection
              title="Visible"
              fields={visibleRecordFields}
              isDraggable
              onDragEnd={handleReorderFields}
              onVisibilityChange={handleChangeFieldVisibility}
              showSubheader={false}
              showDragGrip={true}
            />
          </ScrollWrapper>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            <MenuItemNavigate
              onClick={() => handleSelectMenu('hiddenFields')}
              LeftIcon={IconEyeOff}
              text="Hidden Fields"
            />
          </DropdownMenuItemsContainer>
        </>
      )}
      {currentMenu === 'hiddenViewGroups' && (
        <>
          <DropdownMenuHeader
            StartIcon={IconChevronLeft}
            onClick={() => setCurrentMenu('viewGroups')}
          >
            Hidden {viewGroupFieldMetadataItem?.label}
          </DropdownMenuHeader>
          <ViewGroupsVisibilityDropdownSection
            title={`Hidden ${viewGroupFieldMetadataItem?.label}`}
            viewGroups={hiddenRecordGroups}
            onVisibilityChange={handleRecordGroupVisibilityChange}
            isDraggable={false}
            showSubheader={false}
            showDragGrip={false}
          />
          <DropdownMenuSeparator />
          <UndecoratedLink
            to={viewGroupSettingsUrl}
            onClick={() => {
              setNavigationMemorizedUrl(location.pathname + location.search);
              closeDropdown();
            }}
          >
            <DropdownMenuItemsContainer>
              <MenuItem LeftIcon={IconSettings} text="Edit field values" />
            </DropdownMenuItemsContainer>
          </UndecoratedLink>
        </>
      )}
      {currentMenu === 'hiddenFields' && (
        <>
          <DropdownMenuHeader
            StartIcon={IconChevronLeft}
            onClick={() => setCurrentMenu('fields')}
          >
            Hidden Fields
          </DropdownMenuHeader>
          {hiddenRecordFields.length > 0 && (
            <ScrollWrapper contextProviderName="dropdownMenuItemsContainer">
              <ViewFieldsVisibilityDropdownSection
                title="Hidden"
                fields={hiddenRecordFields}
                isDraggable={false}
                onVisibilityChange={handleChangeFieldVisibility}
                showSubheader={false}
                showDragGrip={false}
              />
            </ScrollWrapper>
          )}
          <DropdownMenuSeparator />

          <UndecoratedLink
            to={settingsUrl}
            onClick={() => {
              setNavigationMemorizedUrl(location.pathname + location.search);
              closeDropdown();
            }}
          >
            <DropdownMenuItemsContainer>
              <MenuItem LeftIcon={IconSettings} text="Edit Fields" />
            </DropdownMenuItemsContainer>
          </UndecoratedLink>
        </>
      )}

      {viewType === ViewType.Kanban && !currentMenu && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            <MenuItemToggle
              LeftIcon={IconBaselineDensitySmall}
              onToggleChange={() =>
                setAndPersistIsCompactModeActive(
                  !isCompactModeActive,
                  currentViewWithCombinedFiltersAndSorts,
                )
              }
              toggled={isCompactModeActive}
              text="Compact view"
              toggleSize="small"
            />
          </DropdownMenuItemsContainer>
        </>
      )}
    </>
  );
};
