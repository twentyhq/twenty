import { useEffect } from 'react';
import { Key } from 'ts-key-enum';
import {
  IconChevronLeft,
  IconCircleOff,
  IconEyeOff,
  IconHandMove,
  IconLayoutList,
  IconSettings,
  IconSortAZ,
  IconSortDescending,
  IconSortZA,
  MenuItem,
  MenuItemNavigate,
  MenuItemToggle,
  UndecoratedLink,
  useIcons,
} from 'twenty-ui';

import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { StyledInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelect';
import { RecordIndexOptionsContentId } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownContent';
import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useSearchRecordGroupField } from '@/object-record/object-options-dropdown/hooks/useRecordGroupFieldsDropdown';
import { objectOptionsDropdownRecordGroupHideComponentState } from '@/object-record/object-options-dropdown/states/objectOptionsDropdownRecordGroupHideComponentState';
import { objectOptionsDropdownRecordGroupSortComponentState } from '@/object-record/object-options-dropdown/states/objectOptionsDropdownRecordGroupSortComponentState';
import { objectOptionsDropdownRecordGroupIsDragableSortComponentSelector } from '@/object-record/object-options-dropdown/states/selectors/objectOptionsDropdownRecordGroupIsDragableSortComponentSelector';
import { useRecordGroupReorder } from '@/object-record/record-group/hooks/useRecordGroupReorder';
import { useRecordGroups } from '@/object-record/record-group/hooks/useRecordGroups';
import { useRecordGroupSelector } from '@/object-record/record-group/hooks/useRecordGroupSelector';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
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
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { RecordGroupsVisibilityDropdownSection } from '@/views/components/RecordGroupsVisibilityDropdownSection';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

type ObjectOptionsDropdownRecordGroupContentProps = {
  recordIndexId: string;
  objectMetadataItem: ObjectMetadataItem;
};

export const ObjectOptionsDropdownRecordGroupContent = ({
  recordIndexId,
  objectMetadataItem,
}: ObjectOptionsDropdownRecordGroupContentProps) => {
  const { getIcon } = useIcons();

  const { currentContentId, onContentChange, resetContent } =
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

  const {
    hiddenRecordGroups,
    visibleRecordGroups,
    viewGroupFieldMetadataItem,
  } = useRecordGroups({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const isDragableSortRecordGroup = useRecoilComponentValueV2(
    objectOptionsDropdownRecordGroupIsDragableSortComponentSelector,
  );

  const setRecordGroupSort = useSetRecoilComponentStateV2(
    objectOptionsDropdownRecordGroupSortComponentState,
  );

  const [hideEmptyRecordGroup, setHideEmptyRecordGroup] =
    useRecoilComponentStateV2(
      objectOptionsDropdownRecordGroupHideComponentState,
    );

  const {
    recordGroupFieldSearchInput,
    setRecordGroupFieldSearchInput,
    filteredRecordGroupFieldMetadataItems,
  } = useSearchRecordGroupField();

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
        <StyledInput
          autoFocus
          value={recordGroupFieldSearchInput}
          placeholder="Search fields"
          onChange={(event) =>
            setRecordGroupFieldSearchInput(event.target.value)
          }
        />
        <MenuItem text="None" />
        {filteredRecordGroupFieldMetadataItems.map((fieldMetadataItem) => (
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
        <MenuItem
          onClick={() => onContentChange('recordGroupSort')}
          LeftIcon={IconSortDescending}
          text="Sort"
          hasSubMenu
        />
        <MenuItemToggle
          LeftIcon={IconCircleOff}
          onToggleChange={() => setHideEmptyRecordGroup((prev) => !prev)}
          toggled={hideEmptyRecordGroup}
          text="Hide empty groups"
          toggleSize="small"
        />
        <DropdownMenuSeparator />
        <RecordGroupsVisibilityDropdownSection
          title="Visible groups"
          viewGroups={visibleRecordGroups}
          onDragEnd={handleRecordGroupOrderChange}
          onVisibilityChange={handleRecordGroupVisibilityChange}
          isDraggable={isDragableSortRecordGroup}
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
        <RecordGroupsVisibilityDropdownSection
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

      <DropdownContentItem id="recordGroupSort">
        <DropdownMenuHeader
          StartIcon={IconChevronLeft}
          onClick={() => onContentChange('recordGroups')}
        >
          Sort
        </DropdownMenuHeader>
        <MenuItem
          onClick={() => {
            setRecordGroupSort(RecordGroupSort.MANUAL);
            closeDropdown();
          }}
          LeftIcon={IconHandMove}
          text={RecordGroupSort.MANUAL}
        />
        <MenuItem
          onClick={() => {
            setRecordGroupSort(RecordGroupSort.ALPHABETICAL);
            closeDropdown();
          }}
          LeftIcon={IconSortAZ}
          text={RecordGroupSort.ALPHABETICAL}
        />
        <MenuItem
          onClick={() => {
            setRecordGroupSort(RecordGroupSort.REVERSE_ALPHABETICAL);
            closeDropdown();
          }}
          LeftIcon={IconSortZA}
          text={RecordGroupSort.REVERSE_ALPHABETICAL}
        />
      </DropdownContentItem>
    </>
  );
};
