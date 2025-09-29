import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

export const ChartDataSourceDropdownContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const currentSource = widgetInEditMode?.configuration?.source;

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const availableObjectMetadataItems = objectMetadataItems.filter(
    (objectMetadataItem) => {
      const objectPermissions =
        objectPermissionsByObjectMetadataId[objectMetadataItem.id];

      const hasReadAccess =
        isDefined(objectPermissions) && objectPermissions.canReadObjectRecords;

      const matchesSearch =
        !isNonEmptyString(searchQuery) ||
        objectMetadataItem.labelPlural
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        objectMetadataItem.namePlural
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return hasReadAccess && matchesSearch;
    },
  );

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const { getIcon } = useIcons();

  const handleSelectSource = (objectMetadataId: string) => {
    updateCurrentWidgetConfig({
      source: objectMetadataId,
    });
    closeDropdown();
  };

  return (
    <>
      <DropdownMenuHeader>Source</DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder="Search objects"
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={availableObjectMetadataItems.map(
            (item) => item.id,
          )}
        >
          {availableObjectMetadataItems.map((objectMetadataItem) => (
            <SelectableListItem
              key={objectMetadataItem.id}
              itemId={objectMetadataItem.id}
              onEnter={() => {
                handleSelectSource(objectMetadataItem.id);
              }}
            >
              <MenuItemSelect
                text={objectMetadataItem.labelPlural}
                selected={currentSource === objectMetadataItem.id}
                focused={selectedItemId === objectMetadataItem.id}
                LeftIcon={getIcon(objectMetadataItem.icon)}
                onClick={() => {
                  handleSelectSource(objectMetadataItem.id);
                }}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
