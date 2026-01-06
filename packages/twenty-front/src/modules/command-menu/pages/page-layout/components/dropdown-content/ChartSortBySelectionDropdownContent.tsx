import { useState } from 'react';

import { ChartManualSortSubMenuContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartManualSortSubMenuContent';
import { X_SORT_BY_OPTIONS } from '@/command-menu/pages/page-layout/constants/XSortByOptions';
import { useGraphXSortOptionLabels } from '@/command-menu/pages/page-layout/hooks/useGraphXSortOptionLabels';
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
import { type CompositeFieldSubFieldName } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { MenuItemSelect } from 'twenty-ui/navigation';
import {
  type BarChartConfiguration,
  GraphOrderBy,
  type LineChartConfiguration,
} from '~/generated/graphql';

export const ChartSortBySelectionDropdownContent = () => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { objectMetadataItems } = useObjectMetadataItems();
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
  const { closeDropdown } = useCloseDropdown();

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const configuration = widgetInEditMode?.configuration;

  const isPieChart = isWidgetConfigurationOfType(
    configuration,
    'PieChartConfiguration',
  );
  const isLineChart = isWidgetConfigurationOfType(
    configuration,
    'LineChartConfiguration',
  );
  const isBarChart = isWidgetConfigurationOfType(
    configuration,
    'BarChartConfiguration',
  );

  if (!isBarChart && !isLineChart && !isPieChart) {
    throw new Error('Invalid configuration type');
  }

  if (!isDefined(widgetInEditMode?.objectMetadataId)) {
    throw new Error('No data source in chart');
  }

  const { getXSortOptionLabel } = useGraphXSortOptionLabels({
    objectMetadataId: widgetInEditMode.objectMetadataId,
  });

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widgetInEditMode.objectMetadataId,
  );

  let currentOrderBy: GraphOrderBy | undefined;
  let groupByFieldMetadataId: string | undefined;
  let groupBySubFieldName: string | null | undefined;

  if (isPieChart) {
    currentOrderBy = configuration.orderBy ?? undefined;
    groupByFieldMetadataId = configuration.groupByFieldMetadataId;
    groupBySubFieldName = configuration.groupBySubFieldName;
  } else {
    const barOrLineChartConfiguration = configuration as
      | BarChartConfiguration
      | LineChartConfiguration;
    currentOrderBy =
      barOrLineChartConfiguration.primaryAxisOrderBy ?? undefined;
    groupByFieldMetadataId =
      barOrLineChartConfiguration.primaryAxisGroupByFieldMetadataId;
    groupBySubFieldName =
      barOrLineChartConfiguration.primaryAxisGroupBySubFieldName;
  }

  const primaryAxisField = objectMetadataItem?.fields.find(
    (field) => field.id === groupByFieldMetadataId,
  );

  if (!isDefined(primaryAxisField)) {
    return null;
  }

  const existingManualSortOrder = isPieChart
    ? configuration.manualSortOrder
    : (configuration as BarChartConfiguration | LineChartConfiguration)
        .primaryAxisManualSortOrder;

  const handleSelect = (orderBy: GraphOrderBy) => {
    const configToUpdate: Record<string, unknown> = {};

    if (orderBy === GraphOrderBy.MANUAL) {
      const orderByKey = isPieChart ? 'orderBy' : 'primaryAxisOrderBy';
      const manualSortOrderKey = isPieChart
        ? 'manualSortOrder'
        : 'primaryAxisManualSortOrder';

      configToUpdate[orderByKey] = orderBy;

      if (!isDefined(existingManualSortOrder)) {
        configToUpdate[manualSortOrderKey] = getDefaultManualSortOrder(
          primaryAxisField?.options,
        );
      }

      updateCurrentWidgetConfig({ configToUpdate });
      setIsSubMenuOpen(true);
      return;
    }

    if (currentOrderBy === GraphOrderBy.MANUAL) {
      const manualSortOrderKey = isPieChart
        ? 'manualSortOrder'
        : 'primaryAxisManualSortOrder';
      configToUpdate[manualSortOrderKey] = null;
    }

    if (isPieChart) {
      configToUpdate.orderBy = orderBy;
    } else {
      configToUpdate.primaryAxisOrderBy = orderBy;
    }

    updateCurrentWidgetConfig({ configToUpdate });
    closeDropdown();
  };

  const availableOptions = filterSortOptionsByFieldType({
    options: X_SORT_BY_OPTIONS,
    fieldType: primaryAxisField?.type,
  });

  if (isSubMenuOpen && isDefined(primaryAxisField)) {
    return (
      <ChartManualSortSubMenuContent
        fieldMetadataItem={primaryAxisField}
        axis={'primary'}
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
                handleSelect(sortOption.value);
              }}
            >
              <MenuItemSelect
                text={getXSortOptionLabel({
                  graphOrderBy: sortOption.value,
                  groupByFieldMetadataIdX: groupByFieldMetadataId ?? '',
                  groupBySubFieldNameX: groupBySubFieldName as
                    | CompositeFieldSubFieldName
                    | undefined,
                  aggregateFieldMetadataId:
                    configuration.aggregateFieldMetadataId ?? undefined,
                  aggregateOperation:
                    configuration.aggregateOperation ?? undefined,
                })}
                selected={currentOrderBy === sortOption.value}
                focused={selectedItemId === sortOption.value}
                LeftIcon={
                  sortOption.icon ??
                  getSortIconForFieldType({
                    fieldType: primaryAxisField?.type,
                    orderBy: sortOption.value,
                  })
                }
                hasSubMenu={isManualOption}
                onClick={() => {
                  handleSelect(sortOption.value);
                }}
              />
            </SelectableListItem>
          );
        })}
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
