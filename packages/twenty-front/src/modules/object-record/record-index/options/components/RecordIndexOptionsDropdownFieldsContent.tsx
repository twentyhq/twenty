import { Key } from 'ts-key-enum';
import {
  IconChevronLeft,
  IconEyeOff,
  IconSettings,
  MenuItem,
  MenuItemNavigate,
  UndecoratedLink,
} from 'twenty-ui';

import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';
import { RECORD_INDEX_OPTIONS_DROPDOWN_ID } from '@/object-record/record-index/options/constants/RecordIndexOptionsDropdownId';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordIndexOptionsContentId } from '@/object-record/record-index/options/components/RecordIndexOptionsDropdownContent';
import { useRecordIndexOptionsForBoard } from '@/object-record/record-index/options/hooks/useRecordIndexOptionsForBoard';
import { useRecordIndexOptionsForTable } from '@/object-record/record-index/options/hooks/useRecordIndexOptionsForTable';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { DropdownContentItem } from '@/ui/layout/dropdown/components/DropdownContentItem';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useDropdownContent } from '@/ui/layout/dropdown/hooks/useDropdownContent';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { ViewFieldsVisibilityDropdownSection } from '@/views/components/ViewFieldsVisibilityDropdownSection';
import { ViewType } from '@/views/types/ViewType';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

type RecordIndexOptionsDropdownFieldsContentProps = {
  recordIndexId: string;
  objectMetadataItem: ObjectMetadataItem;
  viewType: ViewType;
};

export const RecordIndexOptionsDropdownFieldsContent = ({
  viewType,
  recordIndexId,
  objectMetadataItem,
}: RecordIndexOptionsDropdownFieldsContentProps) => {
  const { onContentChange, resetContent } =
    useDropdownContent<RecordIndexOptionsContentId>();

  const { closeDropdown } = useDropdown(RECORD_INDEX_OPTIONS_DROPDOWN_ID);

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

  const {
    visibleBoardFields,
    hiddenBoardFields,
    handleReorderBoardFields,
    handleBoardFieldVisibilityChange,
  } = useRecordIndexOptionsForBoard({
    objectNameSingular: objectMetadataItem.nameSingular,
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

  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  return (
    <>
      <DropdownContentItem id="fields">
        <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetContent}>
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
            onClick={() => onContentChange('hiddenFields')}
            LeftIcon={IconEyeOff}
            text="Hidden Fields"
          />
        </DropdownMenuItemsContainer>
      </DropdownContentItem>

      <DropdownContentItem id="hiddenFields">
        <DropdownMenuHeader
          StartIcon={IconChevronLeft}
          onClick={() => onContentChange('fields')}
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
      </DropdownContentItem>
    </>
  );
};
