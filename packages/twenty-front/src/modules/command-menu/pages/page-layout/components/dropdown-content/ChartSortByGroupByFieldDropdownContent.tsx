import { AGGREGATE_SORT_BY_OPTIONS } from '@/command-menu/pages/page-layout/constants/AggregateSortByOptions';
import { useGraphGroupBySortOptionLabels } from '@/command-menu/pages/page-layout/hooks/useGraphGroupBySortOptionLabels';
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
import { type GraphOrderBy } from '~/generated/graphql';

export const ChartSortByGroupByFieldDropdownContent = () => {
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

  const handleSelectSortOption = (orderBy: GraphOrderBy) => {
    updateCurrentWidgetConfig({
      configToUpdate: { secondaryAxisOrderBy: orderBy },
    });
    closeDropdown();
  };

  const { getGroupBySortOptionLabel } = useGraphGroupBySortOptionLabels({
    objectMetadataId: widgetInEditMode?.objectMetadataId,
  });

  return (
    <>
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
                    configuration.secondaryAxisGroup ?? '',
                })}
                selected={
                  configuration.secondaryAxisOrderBy === sortOption.value
                }
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
