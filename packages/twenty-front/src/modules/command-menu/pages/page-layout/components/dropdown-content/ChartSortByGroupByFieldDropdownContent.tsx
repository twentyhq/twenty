import { AGGREGATE_SORT_BY_OPTIONS } from '@/command-menu/pages/page-layout/constants/AggregateSortByOptions';
import { useGraphGroupBySortOptionLabels } from '@/command-menu/pages/page-layout/hooks/useGraphGroupBySortOptionLabels';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
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
  type BarChartConfiguration,
  type GraphOrderBy,
  type LineChartConfiguration,
  type NumberChartConfiguration,
} from '~/generated/graphql';

type ChartSortByGroupByFieldDropdownContentProps = {
  title: string;
};

export const ChartSortByGroupByFieldDropdownContent = ({
  title,
}: ChartSortByGroupByFieldDropdownContentProps) => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const configuration = widgetInEditMode?.configuration as
    | BarChartConfiguration
    | LineChartConfiguration
    | NumberChartConfiguration;

  const currentOrderBy =
    'orderByY' in configuration
      ? configuration.orderByY
      : 'orderBy' in configuration
        ? configuration.orderBy
        : undefined;

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

  const orderByKey = 'orderByY' in configuration ? 'orderByY' : 'orderBy';

  const handleSelectSortOption = (orderBy: GraphOrderBy) => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        [orderByKey]: orderBy,
      },
    });
    closeDropdown();
  };

  const { getGroupBySortOptionLabel } = useGraphGroupBySortOptionLabels({
    objectMetadataId: widgetInEditMode?.objectMetadataId,
  });

  return (
    <>
      <DropdownMenuHeader>{title}</DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={AGGREGATE_SORT_BY_OPTIONS.map(
            (option) => option.value,
          )}
        >
          {AGGREGATE_SORT_BY_OPTIONS.map((sortOption) => (
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
                    'groupByFieldMetadataIdY' in configuration
                      ? configuration.groupByFieldMetadataIdY
                      : 'groupByFieldMetadataId' in configuration
                        ? configuration.groupByFieldMetadataId
                        : undefined,
                })}
                selected={currentOrderBy === sortOption.value}
                focused={selectedItemId === sortOption.value}
                LeftIcon={sortOption.icon}
                onClick={() => {
                  handleSelectSortOption(sortOption.value);
                }}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
