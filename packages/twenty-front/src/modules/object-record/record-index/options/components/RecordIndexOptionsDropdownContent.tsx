import { useState } from 'react';
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
} from 'twenty-ui';

import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { RECORD_INDEX_OPTIONS_DROPDOWN_ID } from '@/object-record/record-index/options/constants/RecordIndexOptionsDropdownId';
import {
  displayedExportProgress,
  useExportTableData,
} from '@/object-record/record-index/options/hooks/useExportTableData';
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
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemNavigate } from '@/ui/navigation/menu-item/components/MenuItemNavigate';
import { MenuItemToggle } from '@/ui/navigation/menu-item/components/MenuItemToggle';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { ViewFieldsVisibilityDropdownSection } from '@/views/components/ViewFieldsVisibilityDropdownSection';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { ViewType } from '@/views/types/ViewType';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

type RecordIndexOptionsMenu = 'fields' | 'hiddenFields';

type RecordIndexOptionsDropdownContentProps = {
  recordIndexId: string;
  objectNameSingular: string;
  viewType: ViewType;
};

export const RecordIndexOptionsDropdownContent = ({
  viewType,
  recordIndexId,
  objectNameSingular,
}: RecordIndexOptionsDropdownContentProps) => {
  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const { closeDropdown } = useDropdown(RECORD_INDEX_OPTIONS_DROPDOWN_ID);

  const [currentMenu, setCurrentMenu] = useState<
    RecordIndexOptionsMenu | undefined
  >(undefined);

  const resetMenu = () => setCurrentMenu(undefined);

  const handleSelectMenu = (option: RecordIndexOptionsMenu) => {
    setCurrentMenu(option);
  };

  const { objectNamePlural } = useObjectNamePluralFromSingular({
    objectNameSingular: objectNameSingular,
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
      objectNameSingular,
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
    objectNameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
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
    useOpenObjectRecordsSpreasheetImportDialog(objectNameSingular);

  const { progress, download } = useExportTableData({
    delayMs: 100,
    filename: `${objectNameSingular}.csv`,
    objectNameSingular,
    recordIndexId,
    viewType,
  });

  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  return (
    <>
      {!currentMenu && (
        <DropdownMenuItemsContainer>
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
            text={displayedExportProgress(progress)}
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
      {currentMenu === 'fields' && (
        <>
          <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetMenu}>
            Fields
          </DropdownMenuHeader>
          <ViewFieldsVisibilityDropdownSection
            title="Visible"
            fields={visibleRecordFields}
            isDraggable
            onDragEnd={handleReorderFields}
            onVisibilityChange={handleChangeFieldVisibility}
            showSubheader={false}
            showDragGrip={true}
          />
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
      {currentMenu === 'hiddenFields' && (
        <>
          <DropdownMenuHeader
            StartIcon={IconChevronLeft}
            onClick={() => setCurrentMenu('fields')}
          >
            Hidden Fields
          </DropdownMenuHeader>
          {hiddenRecordFields.length > 0 && (
            <>
              <ViewFieldsVisibilityDropdownSection
                title="Hidden"
                fields={hiddenRecordFields}
                isDraggable={false}
                onVisibilityChange={handleChangeFieldVisibility}
                showSubheader={false}
                showDragGrip={false}
              />
            </>
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
