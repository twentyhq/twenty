import { ChartRatioOptionValueSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartRatioOptionValueSelectionDropdownContent';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { DASHBOARD_AGGREGATE_OPERATION_RATIO } from '@/page-layout/widgets/graph/constants/DashboardAggregateOperationRatio.constant';
import { type AggregateChartOperation } from '@/page-layout/widgets/graph/graphWidgetAggregateChart/types/AggregateChartOperation';
import { getAggregateChartOperationLabel } from '@/page-layout/widgets/graph/graphWidgetAggregateChart/utils/getAggregateChartOperationLabel';
import { getAvailableAggregateOperationsForAggregateChart } from '@/page-layout/widgets/graph/graphWidgetAggregateChart/utils/getAvailableAggregateOperationsForAggregateChart';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { GraphType, type AggregateOperations } from '~/generated/graphql';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

export const ChartAggregateOperationSelectionDropdownContent = ({
  currentFieldMetadataId,
  setIsSubMenuOpen,
}: {
  currentFieldMetadataId: string;
  setIsSubMenuOpen: (isSubMenuOpen: boolean) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOptionValueMenuOpen, setIsOptionValueMenuOpen] = useState(false);
  const { objectMetadataItems } = useObjectMetadataItems();
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  if (
    widgetInEditMode?.configuration?.__typename !== 'BarChartConfiguration' &&
    widgetInEditMode?.configuration?.__typename !== 'LineChartConfiguration' &&
    widgetInEditMode?.configuration?.__typename !==
      'AggregateChartConfiguration' &&
    widgetInEditMode?.configuration?.__typename !== 'PieChartConfiguration'
  ) {
    throw new Error('Invalid configuration type');
  }

  const currentAggregateOperation =
    widgetInEditMode.configuration.aggregateOperation;

  const sourceObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widgetInEditMode.objectMetadataId,
  );

  const selectedField = sourceObjectMetadataItem?.fields.find(
    (field) => field.id === currentFieldMetadataId,
  );

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const isAggregateChart =
    widgetInEditMode.configuration.graphType === GraphType.AGGREGATE;

  const isAggregateOrGaugeChart =
    isAggregateChart ||
    widgetInEditMode.configuration.graphType === GraphType.GAUGE;

  const availableAggregateOperations: AggregateChartOperation[] = selectedField
    ? isAggregateChart
      ? getAvailableAggregateOperationsForAggregateChart({
          fieldMetadataType: selectedField.type,
        })
      : getAvailableAggregateOperationsForFieldMetadataType({
          fieldMetadataType: selectedField.type,
        })
    : [];

  const filteredAggregateOperations = availableAggregateOperations.filter(
    (operation) => {
      return (
        isAggregateOrGaugeChart ||
        (operation !== DateAggregateOperations.EARLIEST &&
          operation !== DateAggregateOperations.LATEST)
      );
    },
  );

  const aggregateOperationsWithLabels = filteredAggregateOperations.map(
    (operation) => ({
      operation,
      label: getAggregateChartOperationLabel(operation),
    }),
  );

  const filteredAggregateOperationsWithLabels = filterBySearchQuery({
    items: aggregateOperationsWithLabels,
    searchQuery,
    getSearchableValues: (item) => [item.label],
  });

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  if (!isDefined(sourceObjectMetadataItem) || !isDefined(selectedField)) {
    return null;
  }

  const handleSelectAggregateOperation = (
    aggregateOperation: AggregateOperations,
  ) => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        aggregateFieldMetadataId: currentFieldMetadataId,
        aggregateOperation,
        ratioAggregateConfig: null,
      },
    });
    closeDropdown();
  };

  const handleSelectRatio = () => {
    setIsOptionValueMenuOpen(true);
  };

  if (isOptionValueMenuOpen) {
    return (
      <ChartRatioOptionValueSelectionDropdownContent
        currentFieldMetadataId={currentFieldMetadataId}
        setIsOptionValueMenuOpen={setIsOptionValueMenuOpen}
      />
    );
  }

  return (
    <>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => setIsSubMenuOpen(false)}
            Icon={IconChevronLeft}
          />
        }
      >
        {`${selectedField.label}`}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={t`Search operations`}
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={filteredAggregateOperationsWithLabels.map(
            (item) => item.operation,
          )}
        >
          {filteredAggregateOperationsWithLabels.map((item) => {
            const operation = item.operation;
            const currentConfiguration = widgetInEditMode.configuration;
            const isCurrentlyRatio =
              currentConfiguration?.__typename ===
                'AggregateChartConfiguration' &&
              isDefined(currentConfiguration.ratioAggregateConfig);

            if (operation === DASHBOARD_AGGREGATE_OPERATION_RATIO) {
              return (
                <SelectableListItem
                  key={operation}
                  itemId={operation}
                  onEnter={handleSelectRatio}
                >
                  <MenuItemSelect
                    text={item.label}
                    selected={isCurrentlyRatio}
                    focused={selectedItemId === operation}
                    hasSubMenu={true}
                    onClick={handleSelectRatio}
                  />
                </SelectableListItem>
              );
            }

            const handleClick = () => {
              handleSelectAggregateOperation(
                convertExtendedAggregateOperationToAggregateOperation(
                  operation,
                ),
              );
            };

            const isSelected =
              currentAggregateOperation ===
                convertExtendedAggregateOperationToAggregateOperation(
                  operation,
                ) && !isCurrentlyRatio;

            return (
              <SelectableListItem
                key={operation}
                itemId={operation}
                onEnter={handleClick}
              >
                <MenuItemSelect
                  text={item.label}
                  selected={isSelected}
                  focused={selectedItemId === operation}
                  onClick={handleClick}
                />
              </SelectableListItem>
            );
          })}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
