import { Key } from 'ts-key-enum';
import {
  IconBaselineDensitySmall,
  IconFileExport,
  IconFileImport,
  IconLayoutList,
  IconRotate2,
  IconTag,
  MenuItem,
  MenuItemToggle,
} from 'twenty-ui';

import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { RECORD_INDEX_OPTIONS_DROPDOWN_ID } from '@/object-record/record-index/options/constants/RecordIndexOptionsDropdownId';

import {
  displayedExportProgress,
  useExportRecordData,
} from '@/action-menu/hooks/useExportRecordData';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecordGroups } from '@/object-record/record-group/hooks/useRecordGroups';
import { RecordIndexOptionsDropdownFieldsContent } from '@/object-record/record-index/options/components/RecordIndexOptionsDropdownFieldsContent';
import { RecordIndexOptionsDropdownRecordGroupContent } from '@/object-record/record-index/options/components/RecordIndexOptionsDropdownRecordGroupContent';
import { useRecordIndexOptionsForBoard } from '@/object-record/record-index/options/hooks/useRecordIndexOptionsForBoard';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { useOpenObjectRecordsSpreasheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreasheetImportDialog';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useDropdownContent } from '@/ui/layout/dropdown/hooks/useDropdownContent';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { ViewType } from '@/views/types/ViewType';

export type RecordIndexOptionsContentId =
  | 'fields'
  | 'hiddenFields'
  | 'recordGroups'
  | 'hiddenRecordGroups'
  | 'recordGroupFields';

type RecordIndexOptionsDropdownContentProps = {
  recordIndexId: string;
  objectMetadataItem: ObjectMetadataItem;
  viewType: ViewType;
};

export const RecordIndexOptionsDropdownContent = ({
  viewType,
  recordIndexId,
  objectMetadataItem,
}: RecordIndexOptionsDropdownContentProps) => {
  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const { currentContentId, onContentChange } =
    useDropdownContent<RecordIndexOptionsContentId>();

  const { closeDropdown } = useDropdown(RECORD_INDEX_OPTIONS_DROPDOWN_ID);

  const { objectNamePlural } = useObjectNamePluralFromSingular({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

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

  const {
    visibleBoardFields,
    isCompactModeActive,
    setAndPersistIsCompactModeActive,
  } = useRecordIndexOptionsForBoard({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const { viewGroupFieldMetadataItem } = useRecordGroups({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const { openObjectRecordsSpreasheetImportDialog } =
    useOpenObjectRecordsSpreasheetImportDialog(objectMetadataItem.nameSingular);

  const { progress, download } = useExportRecordData({
    delayMs: 100,
    filename: `${objectMetadataItem.nameSingular}.csv`,
    objectMetadataItem,
    recordIndexId,
    viewType,
  });

  const contextualFieldsText =
    visibleBoardFields.length > 1
      ? `${visibleBoardFields.length} shown`
      : `${visibleBoardFields.length} show`;

  return (
    <>
      {!currentContentId && (
        <DropdownMenuItemsContainer>
          <MenuItem
            onClick={() => onContentChange('fields')}
            LeftIcon={IconTag}
            text="Fields"
            contextualText={contextualFieldsText}
            hasSubMenu
          />
          <MenuItem
            onClick={() => onContentChange('recordGroups')}
            LeftIcon={IconLayoutList}
            text="Group by"
            contextualText={viewGroupFieldMetadataItem?.label}
            hasSubMenu
          />
          <DropdownMenuSeparator />
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
      )}

      <RecordIndexOptionsDropdownFieldsContent
        viewType={viewType}
        recordIndexId={recordIndexId}
        objectMetadataItem={objectMetadataItem}
      />

      <RecordIndexOptionsDropdownRecordGroupContent
        recordIndexId={recordIndexId}
        objectMetadataItem={objectMetadataItem}
      />

      {viewType === ViewType.Kanban && !currentContentId && (
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
