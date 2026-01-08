import { useState } from 'react';

import { ChartManualSortSubMenuContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartManualSortSubMenuContent';
import { AGGREGATE_SORT_BY_OPTIONS } from '@/command-menu/pages/page-layout/constants/AggregateSortByOptions';
import { useGraphGroupBySortOptionLabels } from '@/command-menu/pages/page-layout/hooks/useGraphGroupBySortOptionLabels';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { filterSortOptionsByFieldType } from '@/command-menu/pages/page-layout/utils/filterSortOptionsByFieldType';
import { getDefaultManualSortOrder } from '@/command-menu/pages/page-layout/utils/getDefaultManualSortOrder';
import { getSortIconForFieldType } from '@/command-menu/pages/page-layout/utils/getSortIconForFieldType';
import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';
import { MenuItemSelect } from 'twenty-ui/navigation';
import {
  GraphOrderBy,
  type GraphOrderBy as GraphOrderByType,
} from '~/generated/graphql';

export const ChartSortByGroupByFieldDropdownContent = () => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { objectMetadataItems } = useObjectMetadataItems();
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
  const { closeDropdown } = useCloseDropdown();

  const configuration = widgetInEditMode?.configuration;

  const isBarOrLineChart =
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration');

  if (!isBarOrLineChart) {
    throw new Error('Invalid configuration type');
  }

  if (!isDefined(widgetInEditMode?.objectMetadataId)) {
    throw new Error('No data source in chart');
  }

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widgetInEditMode.objectMetadataId,
  );

  const secondaryAxisField = objectMetadataItem?.fields.find(
    (field) => field.id === configuration.secondaryAxisGroupByFieldMetadataId,
  );

  const { getGroupBySortOptionLabel } = useGraphGroupBySortOptionLabels({
    objectMetadataId: widgetInEditMode.objectMetadataId,
  });

  if (!isDefined(secondaryAxisField)) {
    return null;
  }

  const handleSelectSortOption = (orderBy: GraphOrderByType) => {
    const configToUpdate: Record<string, unknown> = {
      secondaryAxisOrderBy: orderBy,
    };

    if (orderBy === GraphOrderBy.MANUAL) {
      const existingManualSortOrder =
        configuration.secondaryAxisManualSortOrder;

      if (!isDefined(existingManualSortOrder)) {
        configToUpdate.secondaryAxisManualSortOrder = getDefaultManualSortOrder(
          secondaryAxisField?.options,
        );
      }

      updateCurrentWidgetConfig({ configToUpdate });
      setIsSubMenuOpen(true);
      return;
    }

    if (configuration.secondaryAxisOrderBy === GraphOrderBy.MANUAL) {
      configToUpdate.secondaryAxisManualSortOrder = null;
    }

    updateCurrentWidgetConfig({ configToUpdate });
    closeDropdown();
  };

  const availableOptions = filterSortOptionsByFieldType({
    options: AGGREGATE_SORT_BY_OPTIONS,
    fieldType: secondaryAxisField?.type,
  });

  if (isSubMenuOpen && isDefined(secondaryAxisField)) {
    return (
      <ChartManualSortSubMenuContent
        fieldMetadataItem={secondaryAxisField}
        axis="secondary"
        onBack={() => setIsSubMenuOpen(false)}
      />
    );
  }

  return (
    <DropdownMenuItemsContainer>
      <SelectableList
        selectableListInstanceId={dropdownId}
        focusId={dropdownId}
        selectableItemIdArray={availableOptions.map((option) => option.value)}
      >
        {availableOptions.map((sortOption) => {
          const isManualOption = sortOption.value === GraphOrderBy.MANUAL;

          return (
            <SelectableListItem
              key={sortOption.value}
              itemId={sortOption.value}
              onEnter={() => {
                handleSelectSortOption(sortOption.value);
              }}
            >
              <MenuItemSelect
                text={getGroupBySortOptionLabel({
                  graphOrderBy: sortOption.value,
                  groupByFieldMetadataId:
                    configuration.secondaryAxisGroupByFieldMetadataId,
                })}
                selected={
                  configuration.secondaryAxisOrderBy === sortOption.value
                }
                focused={selectedItemId === sortOption.value}
                LeftIcon={
                  sortOption.icon ??
                  getSortIconForFieldType({
                    fieldType: secondaryAxisField?.type,
                    orderBy: sortOption.value,
                  })
                }
                hasSubMenu={isManualOption}
                onClick={() => {
                  handleSelectSortOption(sortOption.value);
                }}
              />
            </SelectableListItem>
          );
        })}
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
