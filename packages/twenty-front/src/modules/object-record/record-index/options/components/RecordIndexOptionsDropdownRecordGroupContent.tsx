import { useEffect } from 'react';
import { Key } from 'ts-key-enum';
import {
  IconChevronLeft,
  IconEyeOff,
  IconLayoutList,
  IconSettings,
  MenuItem,
  MenuItemNavigate,
  UndecoratedLink,
  useIcons,
} from 'twenty-ui';

import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';
import { RECORD_INDEX_OPTIONS_DROPDOWN_ID } from '@/object-record/record-index/options/constants/RecordIndexOptionsDropdownId';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecordGroupReorder } from '@/object-record/record-group/hooks/useRecordGroupReorder';
import { useRecordGroups } from '@/object-record/record-group/hooks/useRecordGroups';
import { useRecordGroupSelector } from '@/object-record/record-group/hooks/useRecordGroupSelector';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { RecordIndexOptionsContentId } from '@/object-record/record-index/options/components/RecordIndexOptionsDropdownContent';
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
import { ViewGroupsVisibilityDropdownSection } from '@/views/components/ViewGroupsVisibilityDropdownSection';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

type RecordIndexOptionsDropdownRecordGroupContentProps = {
  recordIndexId: string;
  objectMetadataItem: ObjectMetadataItem;
};

export const RecordIndexOptionsDropdownRecordGroupContent = ({
  recordIndexId,
  objectMetadataItem,
}: RecordIndexOptionsDropdownRecordGroupContentProps) => {
  const { getIcon } = useIcons();

  const { currentContentId, onContentChange, resetContent } =
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

  const {
    hiddenRecordGroups,
    visibleRecordGroups,
    selectableFieldMetadataItems,
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

  const { handleRecordGroupFieldChange } = useRecordGroupSelector({
    viewBarComponentId: recordIndexId,
  });

  const viewGroupSettingsUrl = getSettingsPagePath(SettingsPath.ObjectDetail, {
    id: viewGroupFieldMetadataItem?.name,
    objectSlug: objectNamePlural,
  });

  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  useEffect(() => {
    if (
      currentContentId === 'hiddenRecordGroups' &&
      hiddenRecordGroups.length === 0
    ) {
      onContentChange('recordGroups');
    }
  }, [hiddenRecordGroups, currentContentId, onContentChange]);

  return (
    <>
      <DropdownContentItem id="recordGroupFields">
        <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetContent}>
          Group by
        </DropdownMenuHeader>
        <MenuItem text="None" />
        {selectableFieldMetadataItems.map((fieldMetadataItem) => (
          <MenuItem
            key={fieldMetadataItem.id}
            onClick={() => {
              handleRecordGroupFieldChange(fieldMetadataItem);
            }}
            LeftIcon={getIcon(fieldMetadataItem.icon)}
            text={fieldMetadataItem.label}
          />
        ))}
        <DropdownMenuSeparator />
        <UndecoratedLink
          to={viewGroupSettingsUrl}
          onClick={() => {
            setNavigationMemorizedUrl(location.pathname + location.search);
            closeDropdown();
          }}
        >
          <DropdownMenuItemsContainer>
            <MenuItem LeftIcon={IconSettings} text="Create select field" />
          </DropdownMenuItemsContainer>
        </UndecoratedLink>
      </DropdownContentItem>

      <DropdownContentItem id="recordGroups">
        <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetContent}>
          Group by
        </DropdownMenuHeader>
        <MenuItem
          onClick={() => onContentChange('recordGroupFields')}
          LeftIcon={IconLayoutList}
          text={
            !viewGroupFieldMetadataItem
              ? 'Group by'
              : `Group by "${viewGroupFieldMetadataItem.label}"`
          }
          hasSubMenu
        />
        <DropdownMenuSeparator />
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
                onClick={() => onContentChange('hiddenRecordGroups')}
                LeftIcon={IconEyeOff}
                text={`Hidden ${viewGroupFieldMetadataItem?.label ?? ''}`}
              />
            </DropdownMenuItemsContainer>
          </>
        )}
      </DropdownContentItem>

      <DropdownContentItem id="hiddenRecordGroups">
        <DropdownMenuHeader
          StartIcon={IconChevronLeft}
          onClick={() => onContentChange('recordGroups')}
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
      </DropdownContentItem>
    </>
  );
};
