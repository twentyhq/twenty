import { ChartYAxisAggregateOperationSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/ChartYAxisAggregateOperationSelectionDropdownContent';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

export const ChartYAxisFieldSelectionDropdownContent = () => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const currentSource = widgetInEditMode?.configuration?.source;
  const currentYAxisFieldMetadataId =
    widgetInEditMode?.configuration?.groupByFieldMetadataIdY;

  const [selectedYAxisFieldMetadataId, setSelectedYAxisFieldMetadataId] =
    useState(currentYAxisFieldMetadataId);

  const sourceObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === currentSource,
  );

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const availableFieldMetadataItems =
    sourceObjectMetadataItem?.fields.filter((fieldMetadataItem) => {
      const matchesSearch =
        !isNonEmptyString(searchQuery) ||
        fieldMetadataItem.label
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        fieldMetadataItem.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesSearch;
    }) || [];

  const { getIcon } = useIcons();

  if (!isDefined(sourceObjectMetadataItem)) {
    return;
  }

  if (isSubMenuOpen) {
    return (
      <ChartYAxisAggregateOperationSelectionDropdownContent
        currentYAxisFieldMetadataId={selectedYAxisFieldMetadataId}
        setIsSubMenuOpen={setIsSubMenuOpen}
      />
    );
  }

  return (
    <>
      <DropdownMenuHeader>Y-Axis Field</DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder="Search fields"
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
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
                setSelectedYAxisFieldMetadataId(fieldMetadataItem.id);
              }}
            >
              <MenuItemSelect
                text={fieldMetadataItem.label}
                selected={selectedYAxisFieldMetadataId === fieldMetadataItem.id}
                focused={selectedItemId === fieldMetadataItem.id}
                LeftIcon={getIcon(fieldMetadataItem.icon)}
                hasSubMenu={true}
                onClick={() => {
                  setIsSubMenuOpen(true);
                  setSelectedYAxisFieldMetadataId(fieldMetadataItem.id);
                }}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
