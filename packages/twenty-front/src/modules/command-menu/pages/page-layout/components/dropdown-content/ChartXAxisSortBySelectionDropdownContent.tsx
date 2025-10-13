import { X_SORT_BY_OPTIONS } from '@/command-menu/pages/page-layout/constants/XSortByOptions';
import { useGraphXSortOptionLabels } from '@/command-menu/pages/page-layout/hooks/useGraphXSortOptionLabels';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { MenuItemSelect } from 'twenty-ui/navigation';
import {
  type GraphOrderBy,
  type LineChartConfiguration,
} from '~/generated/graphql';
import { type CompositeFieldSubFieldName } from 'twenty-shared/types';

export const ChartXAxisSortBySelectionDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const configuration = widgetInEditMode?.configuration;

  if (
    configuration?.__typename !== 'BarChartConfiguration' &&
    configuration?.__typename !== 'LineChartConfiguration'
  ) {
    throw new Error('Invalid configuration type');
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
    objectMetadataId: widgetInEditMode?.objectMetadataId,
  });

  // Determine current order by and field metadata based on chart type
  let currentOrderBy: GraphOrderBy | null | undefined;
  let groupByFieldMetadataIdX: string;
  let groupBySubFieldNameX: string | null | undefined;

  if (configuration.__typename === 'BarChartConfiguration') {
    currentOrderBy = configuration.primaryAxisOrderBy;
    groupByFieldMetadataIdX = configuration.primaryAxisGroup ?? '';
    groupBySubFieldNameX = configuration.primaryAxisSubFieldName;
  } else {
    // LineChartConfiguration
    const lineConfig = configuration as LineChartConfiguration;
    currentOrderBy = lineConfig.orderByX;
    groupByFieldMetadataIdX = lineConfig.groupByFieldMetadataIdX ?? '';
    groupBySubFieldNameX = lineConfig.groupBySubFieldNameX;
  }

  const handleSelect = (orderBy: GraphOrderBy) => {
    const configToUpdate =
      configuration.__typename === 'BarChartConfiguration'
        ? { primaryAxisOrderBy: orderBy }
        : { orderByX: orderBy };

    updateCurrentWidgetConfig({
      configToUpdate,
    });
    closeDropdown();
  };

  return (
    <DropdownMenuItemsContainer>
      <SelectableList
        selectableListInstanceId={dropdownId}
        focusId={dropdownId}
        selectableItemIdArray={X_SORT_BY_OPTIONS.map((option) => option.value)}
      >
        {X_SORT_BY_OPTIONS.map((sortOption) => (
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
                groupByFieldMetadataIdX,
                groupBySubFieldNameX:
                  (groupBySubFieldNameX as
                    | CompositeFieldSubFieldName
                    | undefined) ?? undefined,
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
