import { X_SORT_BY_OPTIONS } from '@/command-menu/pages/page-layout/constants/XSortByOptions';
import { useGraphXSortOptionLabels } from '@/command-menu/pages/page-layout/hooks/useGraphXSortOptionLabels';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { getXAxisSortConfiguration } from '@/command-menu/pages/page-layout/utils/getXAxisSortConfiguration';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { type GraphOrderBy } from '~/generated/graphql';

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

  const {
    currentOrderBy,
    groupByFieldMetadataIdX,
    groupBySubFieldNameX,
    getUpdateConfig,
  } = getXAxisSortConfiguration(configuration);

  const handleSelect = (orderBy: GraphOrderBy) => {
    updateCurrentWidgetConfig({
      configToUpdate: getUpdateConfig(orderBy),
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
                groupBySubFieldNameX,
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
