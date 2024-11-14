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

import {
  displayedExportProgress,
  useExportRecordData,
} from '@/action-menu/hooks/useExportRecordData';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectOptionsDropdownFieldsContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownFieldsContent';
import { ObjectOptionsDropdownRecordGroupContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownRecordGroupContent';
import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { useRecordGroups } from '@/object-record/record-group/hooks/useRecordGroups';
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
  | 'recordGroupFields'
  | 'recordGroupSort';

type ObjectOptionsDropdownContentProps = {
  recordIndexId: string;
  objectMetadataItem: ObjectMetadataItem;
  viewType: ViewType;
};

export const ObjectOptionsDropdownContent = ({
  viewType,
  recordIndexId,
  objectMetadataItem,
}: ObjectOptionsDropdownContentProps) => {
  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const { currentContentId, onContentChange } =
    useDropdownContent<RecordIndexOptionsContentId>();

  const { closeDropdown } = useDropdown(OBJECT_OPTIONS_DROPDOWN_ID);

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
  } = useObjectOptionsForBoard({
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

      <ObjectOptionsDropdownFieldsContent
        viewType={viewType}
        recordIndexId={recordIndexId}
        objectMetadataItem={objectMetadataItem}
      />

      <ObjectOptionsDropdownRecordGroupContent
        viewType={viewType}
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
