import { ChartAggregateOperationSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartAggregateOperationSelectionDropdownContent';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

export const ChartFieldSelectionForAggregateOperationDropdownContent = () => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

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

  const currentFieldMetadataId =
    widgetInEditMode.configuration.groupByFieldMetadataIdY;

  const [selectedFieldMetadataId, setSelectedFieldMetadataId] = useState(
    currentFieldMetadataId,
  );

  const sourceObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widgetInEditMode.objectMetadataId,
  );

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const availableFieldMetadataItems = filterBySearchQuery({
    items: sourceObjectMetadataItem?.fields || [],
    searchQuery,
    getSearchableValues: (item) => [item.label, item.name],
  });

  const { getIcon } = useIcons();

  if (!isDefined(sourceObjectMetadataItem)) {
    return null;
  }

  if (isSubMenuOpen) {
    return (
      <ChartAggregateOperationSelectionDropdownContent
        currentFieldMetadataId={selectedFieldMetadataId}
        setIsSubMenuOpen={setIsSubMenuOpen}
      />
    );
  }

  return (
    <>
      <DropdownMenuHeader>
        <Trans>Y-Axis Field</Trans>
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={t`Search fields`}
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={availableFieldMetadataItems.map(
            (item) => item.id,
          )}
        >
          {availableFieldMetadataItems.map((fieldMetadataItem) => (
            <SelectableListItem
              key={fieldMetadataItem.id}
              itemId={fieldMetadataItem.id}
              onEnter={() => {
                setIsSubMenuOpen(true);
                setSelectedFieldMetadataId(fieldMetadataItem.id);
              }}
            >
              <MenuItemSelect
                text={fieldMetadataItem.label}
                selected={selectedFieldMetadataId === fieldMetadataItem.id}
                focused={selectedItemId === fieldMetadataItem.id}
                LeftIcon={getIcon(fieldMetadataItem.icon)}
                hasSubMenu={true}
                onClick={() => {
                  setIsSubMenuOpen(true);
                  setSelectedFieldMetadataId(fieldMetadataItem.id);
                }}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
