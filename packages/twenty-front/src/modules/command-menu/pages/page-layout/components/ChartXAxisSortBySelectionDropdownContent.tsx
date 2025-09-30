import { useGraphSortOptions } from '@/command-menu/pages/page-layout/hooks/useGraphSortOptions';
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
import { type GraphOrderBy } from '~/generated/graphql';

export const ChartXAxisSortBySelectionDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  if (
    widgetInEditMode?.configuration?.__typename !== 'BarChartConfiguration' &&
    widgetInEditMode?.configuration?.__typename !== 'LineChartConfiguration'
  ) {
    throw new Error('Invalid configuration type');
  }

  const configuration = widgetInEditMode?.configuration;
  const currentOrderByX = configuration.orderByX;

  const { sortOptions } = useGraphSortOptions({
    objectMetadataId: widgetInEditMode?.objectMetadataId,
    configuration,
  });

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

  const handleSelectSortOption = (orderByX: GraphOrderBy) => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        orderByX,
      },
    });
    closeDropdown();
  };

  return (
    <>
      <DropdownMenuHeader>X-Axis Sort By</DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={sortOptions.map((option) => option.value)}
        >
          {sortOptions.map((sortOption) => (
            <SelectableListItem
              key={sortOption.value}
              itemId={sortOption.value}
              onEnter={() => {
                handleSelectSortOption(sortOption.value);
              }}
            >
              <MenuItemSelect
                text={sortOption.label}
                selected={currentOrderByX === sortOption.value}
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
