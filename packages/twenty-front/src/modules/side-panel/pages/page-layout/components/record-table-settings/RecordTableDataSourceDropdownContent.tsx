import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { filterReadableActiveObjectMetadataItems } from '@/object-metadata/utils/filterReadableActiveObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { useCreateViewForRecordTableWidget } from '@/page-layout/widgets/record-table/hooks/useCreateViewForRecordTableWidget';
import { useDeleteViewForRecordTableWidget } from '@/page-layout/widgets/record-table/hooks/useDeleteViewForRecordTableWidget';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

export const RecordTableDataSourceDropdownContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { pageLayoutId } = usePageLayoutIdFromContextStore();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const currentObjectMetadataItemId = widgetInEditMode?.objectMetadataId as
    | string
    | undefined;

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { createViewForRecordTableWidget } =
    useCreateViewForRecordTableWidget(pageLayoutId);

  const { deleteViewForRecordTableWidget } =
    useDeleteViewForRecordTableWidget();

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const readableActiveObjectMetadataItems =
    filterReadableActiveObjectMetadataItems(
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    );

  const objectsWithReadAccess = readableActiveObjectMetadataItems.filter(
    (objectMetadataItem) => !objectMetadataItem.isSystem,
  );

  const sortedObjects = objectsWithReadAccess.sort((first, second) =>
    first.labelPlural.localeCompare(second.labelPlural),
  );

  const filteredObjects = filterBySearchQuery({
    items: sortedObjects,
    searchQuery,
    getSearchableValues: (item) => [item.labelPlural, item.namePlural],
  });

  const currentViewId =
    widgetInEditMode?.configuration &&
    'viewId' in widgetInEditMode.configuration
      ? (widgetInEditMode.configuration.viewId as string | undefined)
      : undefined;

  const handleSelectSource = async (newObjectMetadataItemId: string) => {
    if (currentObjectMetadataItemId === newObjectMetadataItemId) {
      closeDropdown();
      return;
    }

    if (isDefined(currentViewId)) {
      await deleteViewForRecordTableWidget(currentViewId);
    }

    updateCurrentWidgetConfig({
      objectMetadataId: newObjectMetadataItemId,
      configToUpdate: {
        viewId: undefined,
      },
    });

    const selectedObjectMetadataItem = objectMetadataItems.find(
      (item) => item.id === newObjectMetadataItemId,
    );

    if (isDefined(selectedObjectMetadataItem) && isDefined(widgetInEditMode)) {
      await createViewForRecordTableWidget(
        widgetInEditMode.id,
        selectedObjectMetadataItem,
      );

      updatePageLayoutWidget(widgetInEditMode.id, {
        title: selectedObjectMetadataItem.labelPlural,
      });
    }

    closeDropdown();
  };

  return (
    <>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={t`Search objects`}
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={filteredObjects.map(
            (objectMetadataItem) => objectMetadataItem.id,
          )}
        >
          {filteredObjects.map((objectMetadataItem) => (
            <SelectableListItem
              key={objectMetadataItem.id}
              itemId={objectMetadataItem.id}
              onEnter={() => {
                handleSelectSource(objectMetadataItem.id);
              }}
            >
              <MenuItemSelect
                text={objectMetadataItem.labelPlural}
                selected={currentObjectMetadataItemId === objectMetadataItem.id}
                focused={selectedItemId === objectMetadataItem.id}
                LeftIcon={() => (
                  <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
                )}
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
