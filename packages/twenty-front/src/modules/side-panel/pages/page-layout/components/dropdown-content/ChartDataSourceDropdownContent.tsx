import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { filterReadableActiveObjectMetadataItems } from '@/object-metadata/utils/filterReadableActiveObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useResetChartDraftFiltersSettings } from '@/side-panel/pages/page-layout/hooks/useResetChartDraftFiltersSettings';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import {
  StyledPageLayoutDropdownContentContainer,
  StyledPageLayoutDropdownMenuItemsContainer,
} from '@/side-panel/pages/page-layout/components/dropdown-content/PageLayoutDropdownContentContainer';
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
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

export const ChartDataSourceDropdownContent = () => {
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

  const searchableObjects = useMemo(() => {
    const objectsWithReadAccess = filterReadableActiveObjectMetadataItems(
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    );

    const regularObjects = objectsWithReadAccess
      .filter((item) => item.isSystem === false)
      .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));

    const systemObjects = objectsWithReadAccess
      .filter((item) => item.isSystem === true)
      .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));

    return [...regularObjects, ...systemObjects];
  }, [objectMetadataItems, objectPermissionsByObjectMetadataId]);

  const availableObjectMetadataItems = filterBySearchQuery({
    items: searchableObjects,
    searchQuery,
    getSearchableValues: (item) => [item.labelPlural, item.namePlural],
  });

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const { resetChartDraftFiltersSettings } =
    useResetChartDraftFiltersSettings();

  const handleSelectSource = (newObjectMetadataItemId: string) => {
    if (currentObjectMetadataItemId !== newObjectMetadataItemId) {
      updateCurrentWidgetConfig({
        objectMetadataId: newObjectMetadataItemId,
        configToUpdate: {
          aggregateFieldMetadataId: undefined,
          primaryAxisGroupByFieldMetadataId: undefined,
          primaryAxisGroupBySubFieldName: undefined,
          secondaryAxisGroupByFieldMetadataId: undefined,
          secondaryAxisGroupBySubFieldName: undefined,
          primaryAxisOrderBy: undefined,
          secondaryAxisOrderBy: undefined,
          groupByFieldMetadataId: undefined,
          groupBySubFieldName: undefined,
          filter: {},
          ratioAggregateConfig: undefined,
        },
      });

      if (isDefined(currentObjectMetadataItemId)) {
        resetChartDraftFiltersSettings(currentObjectMetadataItemId);
      }
    }
    closeDropdown();
  };

  return (
    <StyledPageLayoutDropdownContentContainer>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={t`Search objects`}
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuSeparator />
      <StyledPageLayoutDropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={availableObjectMetadataItems.map(
            (objectMetadataItem) => objectMetadataItem.id,
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
      </StyledPageLayoutDropdownMenuItemsContainer>
    </StyledPageLayoutDropdownContentContainer>
  );
};
