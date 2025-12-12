import { ChartManualSortContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartManualSortContent';
import { AGGREGATE_SORT_BY_OPTIONS } from '@/command-menu/pages/page-layout/constants/AggregateSortByOptions';
import { useGraphGroupBySortOptionLabels } from '@/command-menu/pages/page-layout/hooks/useGraphGroupBySortOptionLabels';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { MenuItemSelect } from 'twenty-ui/navigation';
import {
  GraphOrderBy,
  type GraphOrderBy as GraphOrderByType,
} from '~/generated/graphql';

export const ChartSortByGroupByFieldDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { objectMetadataItems } = useObjectMetadataItems();

  const configuration = widgetInEditMode?.configuration;

  if (
    configuration?.__typename !== 'BarChartConfiguration' &&
    configuration?.__typename !== 'LineChartConfiguration'
  ) {
    throw new Error('Invalid configuration type');
  }

  if (!isDefined(widgetInEditMode?.objectMetadataId)) {
    throw new Error('No data source in chart');
  }

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widgetInEditMode.objectMetadataId,
  );

  const secondaryAxisField = objectMetadataItem?.fields.find(
    (field) => field.id === configuration.secondaryAxisGroupByFieldMetadataId,
  );

  const isSecondaryAxisSelectField =
    secondaryAxisField?.type === FieldMetadataType.SELECT ||
    secondaryAxisField?.type === FieldMetadataType.MULTI_SELECT;

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

  const handleSelectSortOption = (orderBy: GraphOrderByType) => {
    updateCurrentWidgetConfig({
      configToUpdate: { secondaryAxisOrderBy: orderBy },
    });
    closeDropdown();
  };

  const { getGroupBySortOptionLabel } = useGraphGroupBySortOptionLabels({
    objectMetadataId: widgetInEditMode.objectMetadataId,
  });

  const availableOptions = AGGREGATE_SORT_BY_OPTIONS.filter((option) => {
    const isManualSort = option.value === GraphOrderBy.MANUAL;

    if (isManualSort && !isSecondaryAxisSelectField) {
      return false;
    }

    return true;
  });

  const isManualSortSelected =
    configuration.secondaryAxisOrderBy === GraphOrderBy.MANUAL;

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
              handleSelectSortOption(sortOption.value);
            }}
          >
            <MenuItemSelect
              text={getGroupBySortOptionLabel({
                graphOrderBy: sortOption.value,
                groupByFieldMetadataId:
                  configuration.secondaryAxisGroupByFieldMetadataId,
              })}
              selected={configuration.secondaryAxisOrderBy === sortOption.value}
              focused={selectedItemId === sortOption.value}
              LeftIcon={sortOption.icon}
              onClick={() => {
                handleSelectSortOption(sortOption.value);
              }}
            />
          </SelectableListItem>
        ))}
      </SelectableList>
      {isManualSortSelected && isDefined(secondaryAxisField) && (
        <ChartManualSortContent
          fieldMetadataItem={secondaryAxisField}
          axis="secondary"
        />
      )}
    </DropdownMenuItemsContainer>
  );
};
