import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { mapToGraphQLExtendedAggregateOperation } from '@/command-menu/pages/page-layout/utils/mapToGraphQLExtendedAggregateOperation';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
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
import { Trans } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
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
    widgetInEditMode?.configuration?.__typename !== 'LineChartConfiguration'
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

  const aggregateOperationsWithLabels = availableAggregateOperations.map(
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
    aggregateOperation: ExtendedAggregateOperations,
  ) => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        aggregateFieldMetadataId: currentFieldMetadataId,
        aggregateOperation:
          mapToGraphQLExtendedAggregateOperation(aggregateOperation),
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
        <Trans>Y-Axis Aggregate Operation</Trans>
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
                handleSelectAggregateOperation(item.operation);
              }}
            >
              <MenuItemSelect
                text={item.label}
                selected={
                  currentAggregateOperation ===
                  mapToGraphQLExtendedAggregateOperation(item.operation)
                }
                focused={selectedItemId === item.operation}
                onClick={() => {
                  handleSelectAggregateOperation(item.operation);
                }}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
