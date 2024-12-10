import { Key } from 'ts-key-enum';
import {
  IconFileExport,
  IconFileImport,
  IconLayout,
  IconLayoutList,
  IconList,
  IconRotate2,
  IconTag,
  MenuItem,
  useIcons,
} from 'twenty-ui';

import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';

import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import {
  displayedExportProgress,
  useExportRecords,
} from '@/object-record/record-index/export/hooks/useExportRecords';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { useOpenObjectRecordsSpreadsheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreadsheetImportDialog';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { ViewType } from '@/views/types/ViewType';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const ObjectOptionsDropdownMenuContent = () => {
  const {
    recordIndexId,
    objectMetadataItem,
    viewType,
    onContentChange,
    closeDropdown,
  } = useOptionsDropdown();

  const isViewGroupEnabled = useIsFeatureEnabled('IS_VIEW_GROUPS_ENABLED');

  const { getIcon } = useIcons();
  const { currentViewWithCombinedFiltersAndSorts: currentView } =
    useGetCurrentView();

  const CurrentViewIcon = currentView?.icon ? getIcon(currentView.icon) : null;

  const { objectNamePlural } = useObjectNamePluralFromSingular({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const recordGroupFieldMetadata = useRecoilComponentValueV2(
    recordGroupFieldMetadataComponentState,
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      closeDropdown();
    },
    TableOptionsHotkeyScope.Dropdown,
  );

  const { handleToggleTrashColumnFilter, toggleSoftDeleteFilterState } =
    useHandleToggleTrashColumnFilter({
      objectNameSingular: objectMetadataItem.nameSingular,
      viewBarId: recordIndexId,
    });

  const { visibleBoardFields } = useObjectOptionsForBoard({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const { openObjectRecordsSpreasheetImportDialog } =
    useOpenObjectRecordsSpreadsheetImportDialog(
      objectMetadataItem.nameSingular,
    );

  const { progress, download } = useExportRecords({
    delayMs: 100,
    filename: `${objectMetadataItem.nameSingular}.csv`,
    objectMetadataItem,
    recordIndexId,
    viewType,
  });

  return (
    <>
      <DropdownMenuHeader StartIcon={CurrentViewIcon ?? IconList}>
        {currentView?.name}
      </DropdownMenuHeader>
      {/** TODO: Should be removed when view settings contains more options */}
      {viewType === ViewType.Kanban && (
        <>
          <DropdownMenuItemsContainer>
            <MenuItem
              onClick={() => onContentChange('viewSettings')}
              LeftIcon={IconLayout}
              text="View settings"
              hasSubMenu
            />
          </DropdownMenuItemsContainer>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuItemsContainer>
        <MenuItem
          onClick={() => onContentChange('fields')}
          LeftIcon={IconTag}
          text="Fields"
          contextualText={`${visibleBoardFields.length} shown`}
          hasSubMenu
        />
        {(viewType === ViewType.Kanban || isViewGroupEnabled) && (
          <MenuItem
            onClick={() => onContentChange('recordGroups')}
            LeftIcon={IconLayoutList}
            text="Group by"
            contextualText={recordGroupFieldMetadata?.label}
            hasSubMenu
          />
        )}
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <MenuItem
          onClick={download}
          LeftIcon={IconFileExport}
          text={displayedExportProgress(progress)}
        />
        <MenuItem
          onClick={() => openObjectRecordsSpreasheetImportDialog()}
          LeftIcon={IconFileImport}
          text="Import"
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
    </>
  );
};
