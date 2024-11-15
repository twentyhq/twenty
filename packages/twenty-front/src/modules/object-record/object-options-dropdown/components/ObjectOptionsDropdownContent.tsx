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
import { ObjectOptionsDropdownViewSettingsContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownViewSettingsContent';
import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { useRecordGroups } from '@/object-record/record-group/hooks/useRecordGroups';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { useOpenObjectRecordsSpreasheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreasheetImportDialog';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useDropdownContent } from '@/ui/layout/dropdown/hooks/useDropdownContent';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { ViewType } from '@/views/types/ViewType';

export type RecordIndexOptionsContentId =
  | 'viewSettings'
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

  const { visibleBoardFields } = useObjectOptionsForBoard({
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
        <>
          <DropdownMenuHeader StartIcon={IconList}>
            {objectMetadataItem.labelPlural}
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
      )}

      <ObjectOptionsDropdownViewSettingsContent
        viewType={viewType}
        recordIndexId={recordIndexId}
        objectMetadataItem={objectMetadataItem}
      />

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
    </>
  );
};
