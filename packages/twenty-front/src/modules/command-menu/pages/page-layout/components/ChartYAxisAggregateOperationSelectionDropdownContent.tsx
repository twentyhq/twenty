import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

export const ChartYAxisAggregateOperationSelectionDropdownContent = ({
  currentYAxisFieldMetadataId,
  setIsSubMenuOpen,
}: {
  currentYAxisFieldMetadataId: string;
  setIsSubMenuOpen: (isSubMenuOpen: boolean) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const currentSource = widgetInEditMode?.configuration?.source;
  const currentYAxisAggregateOperation =
    widgetInEditMode?.configuration?.aggregateOperation;

  const sourceObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === currentSource,
  );

  const selectedYAxisField = sourceObjectMetadataItem?.fields.find(
    (field) => field.id === currentYAxisFieldMetadataId,
  );

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const availableAggregateOperations = selectedYAxisField
    ? getAvailableAggregateOperationsForFieldMetadataType({
        fieldMetadataType: selectedYAxisField.type,
      })
    : [];

  const filteredAggregateOperations = availableAggregateOperations.filter(
    (operation) => {
      const operationLabel = getAggregateOperationLabel(operation);
      const matchesSearch =
        !isNonEmptyString(searchQuery) ||
        operationLabel.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    },
  );

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  if (!isDefined(sourceObjectMetadataItem) || !isDefined(selectedYAxisField)) {
    return;
  }

  const handleSelectAggregateOperation = (
    aggregateOperation: ExtendedAggregateOperations,
  ) => {
    updateCurrentWidgetConfig({
      groupByFieldMetadataIdY: currentYAxisFieldMetadataId,
      aggregateOperation: aggregateOperation,
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
        Y-Axis Aggregate Operation
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder="Search operations"
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={filteredAggregateOperations.map(
            (operation) => operation,
          )}
        >
          {filteredAggregateOperations.map((aggregateOperation) => (
            <SelectableListItem
              key={aggregateOperation}
              itemId={aggregateOperation}
              onEnter={() => {
                handleSelectAggregateOperation(aggregateOperation);
              }}
            >
              <MenuItemSelect
                text={getAggregateOperationLabel(
                  aggregateOperation as ExtendedAggregateOperations,
                )}
                selected={currentYAxisAggregateOperation === aggregateOperation}
                focused={selectedItemId === aggregateOperation}
                onClick={() => {
                  handleSelectAggregateOperation(aggregateOperation);
                }}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
