import { X_SORT_BY_OPTIONS } from '@/command-menu/pages/page-layout/constants/XSortByOptions';
import { useGraphXSortOptionLabels } from '@/command-menu/pages/page-layout/hooks/useGraphXSortOptionLabels';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { isRelationNestedFieldDateKind } from '@/page-layout/widgets/graph/utils/isRelationNestedFieldDateKind';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type CompositeFieldSubFieldName } from 'twenty-shared/types';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';
import { MenuItemSelect } from 'twenty-ui/navigation';
import {
  type BarChartConfiguration,
  GraphOrderBy,
  type LineChartConfiguration,
} from '~/generated/graphql';

export const ChartSortBySelectionDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const configuration = widgetInEditMode?.configuration;

  if (
    configuration?.__typename !== 'BarChartConfiguration' &&
    configuration?.__typename !== 'LineChartConfiguration' &&
    configuration?.__typename !== 'PieChartConfiguration'
  ) {
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

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
  const { closeDropdown } = useCloseDropdown();

  const { getXSortOptionLabel } = useGraphXSortOptionLabels({
    objectMetadataId: widgetInEditMode.objectMetadataId,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widgetInEditMode.objectMetadataId,
  );

  const isPieChart = configuration.__typename === 'PieChartConfiguration';
  const isLineChart = configuration.__typename === 'LineChartConfiguration';
  const isBarChart = configuration.__typename === 'BarChartConfiguration';

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

  const isPrimaryAxisDateField =
    isFieldMetadataDateKind(primaryAxisField?.type) ||
    (isDefined(primaryAxisField) &&
      isRelationNestedFieldDateKind({
        relationField: primaryAxisField,
        relationNestedFieldName: groupBySubFieldName ?? undefined,
        objectMetadataItems,
      }));

  const handleSelect = (orderBy: GraphOrderBy) => {
    if (isPieChart) {
      updateCurrentWidgetConfig({
        configToUpdate: { orderBy },
      });
    } else {
      updateCurrentWidgetConfig({
        configToUpdate: { primaryAxisOrderBy: orderBy },
      });
    }
    closeDropdown();
  };

  const availableOptions = X_SORT_BY_OPTIONS.filter((option) => {
    const isValueSort =
      option.value === GraphOrderBy.VALUE_ASC ||
      option.value === GraphOrderBy.VALUE_DESC;

    if (isLineChart) {
      return !isValueSort;
    }

    if ((isBarChart || isPieChart) && isPrimaryAxisDateField) {
      return !isValueSort;
    }

    return true;
  });

  return (
    <DropdownMenuItemsContainer>
      <SelectableList
        selectableListInstanceId={dropdownId}
        focusId={dropdownId}
        selectableItemIdArray={availableOptions.map((option) => option.value)}
      >
        {availableOptions.map((sortOption) => (
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
              LeftIcon={sortOption.icon}
              onClick={() => {
                handleSelect(sortOption.value);
              }}
            />
          </SelectableListItem>
        ))}
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
