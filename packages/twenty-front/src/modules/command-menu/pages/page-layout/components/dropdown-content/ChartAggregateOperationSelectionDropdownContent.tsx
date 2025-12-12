import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
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
  const { objectMetadataItems } = useObjectMetadataItems();
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  if (
    widgetInEditMode?.configuration?.__typename !== 'BarChartConfiguration' &&
    widgetInEditMode?.configuration?.__typename !== 'LineChartConfiguration' &&
    widgetInEditMode?.configuration?.__typename !==
      'AggregateChartConfiguration' &&
    widgetInEditMode?.configuration?.__typename !== 'PieChartConfiguration' &&
	widgetInEditMode?.configuration?.__typename !== 'WaffleChartConfiguration'
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

  const availableAggregateOperations = selectedField
    ? getAvailableAggregateOperationsForFieldMetadataType({
        fieldMetadataType: selectedField.type,
      })
    : [];

  const isAggregateOrGaugeChart =
    widgetInEditMode.configuration.graphType === GraphType.AGGREGATE ||
    widgetInEditMode.configuration.graphType === GraphType.GAUGE;

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
      label: getAggregateOperationLabel(operation),
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
      },
    });
    closeDropdown();
  };

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
          {filteredAggregateOperationsWithLabels.map((item) => (
            <SelectableListItem
              key={item.operation}
              itemId={item.operation}
              onEnter={() => {
                handleSelectAggregateOperation(
                  convertExtendedAggregateOperationToAggregateOperation(
                    item.operation,
                  ),
                );
              }}
            >
              <MenuItemSelect
                text={item.label}
                selected={
                  currentAggregateOperation ===
                  convertExtendedAggregateOperationToAggregateOperation(
                    item.operation,
                  )
                }
                focused={selectedItemId === item.operation}
                onClick={() => {
                  handleSelectAggregateOperation(
                    convertExtendedAggregateOperationToAggregateOperation(
                      item.operation,
                    ),
                  );
                }}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
