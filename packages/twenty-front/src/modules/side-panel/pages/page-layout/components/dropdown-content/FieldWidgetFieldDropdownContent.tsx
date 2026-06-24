import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { isAdvancedRelationFieldMetadataItem } from '@/object-record/utils/isAdvancedRelationFieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { useFieldWidgetEligibleFields } from '@/page-layout/widgets/field/hooks/useFieldWidgetEligibleFields';
import {
  getFieldWidgetDefaultDisplayMode,
  isDisplayModeValidForFieldType,
} from '@/page-layout/widgets/field/utils/getFieldWidgetDisplayModeConfig';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { DropdownAdvancedSectionHeader } from '@/ui/layout/dropdown/components/DropdownAdvancedSectionHeader';
import { DropdownAdvancedSectionMenuItem } from '@/ui/layout/dropdown/components/DropdownAdvancedSectionMenuItem';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useMemo, useState } from 'react';
import { useIcons } from 'twenty-ui/icon';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { type FieldConfiguration } from '~/generated-metadata/graphql';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

export const FieldWidgetFieldDropdownContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const { pageLayoutId, objectNameSingular } =
    usePageLayoutIdFromContextStore();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const fieldConfiguration = widgetInEditMode?.configuration as
    | FieldConfiguration
    | undefined;

  const currentFieldMetadataId = fieldConfiguration?.fieldMetadataId;

  const allFieldWidgetFieldMetadataItems =
    useFieldWidgetEligibleFields(objectNameSingular);

  const { objectMetadataItems } = useObjectMetadataItems();

  const advancedFieldMetadataItems = useMemo(
    () =>
      allFieldWidgetFieldMetadataItems.filter((fieldMetadataItem) =>
        isAdvancedRelationFieldMetadataItem(
          fieldMetadataItem,
          objectMetadataItems,
        ),
      ),
    [allFieldWidgetFieldMetadataItems, objectMetadataItems],
  );

  const regularFieldMetadataItems = useMemo(
    () =>
      allFieldWidgetFieldMetadataItems.filter(
        (fieldMetadataItem) =>
          !isAdvancedRelationFieldMetadataItem(
            fieldMetadataItem,
            objectMetadataItems,
          ),
      ),
    [allFieldWidgetFieldMetadataItems, objectMetadataItems],
  );

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const { getIcon } = useIcons();

  const availableFields = filterBySearchQuery({
    items: isAdvancedOpen
      ? advancedFieldMetadataItems
      : regularFieldMetadataItems,
    searchQuery,
    getSearchableValues: (item) => [item.label],
  });

  const shouldShowAdvanced =
    !isAdvancedOpen &&
    advancedFieldMetadataItems.length > 0 &&
    (!isNonEmptyString(searchQuery) ||
      searchQuery.toLowerCase().includes('advanced'));

  const handleOpenAdvanced = () => {
    setIsAdvancedOpen(true);
    setSearchQuery('');
  };

  const handleBackFromAdvanced = () => {
    setIsAdvancedOpen(false);
    setSearchQuery('');
  };

  const { fieldMetadataItem: currentFieldMetadataItem } =
    useFieldMetadataItemById(currentFieldMetadataId ?? '');

  const handleSelectField = (fieldMetadataId: string) => {
    const selectedField = allFieldWidgetFieldMetadataItems.find(
      (field) => field.id === fieldMetadataId,
    );

    const currentDisplayMode = fieldConfiguration?.fieldDisplayMode;

    const needsDisplayModeSwitch =
      isDefined(selectedField) &&
      isDefined(currentDisplayMode) &&
      !isDisplayModeValidForFieldType(
        selectedField.type,
        currentDisplayMode,
        selectedField.relation?.type,
      );

    updateCurrentWidgetConfig({
      configToUpdate: {
        fieldMetadataId,
        ...(needsDisplayModeSwitch && {
          fieldDisplayMode: getFieldWidgetDefaultDisplayMode(
            selectedField.type,
          ),
        }),
      },
    });

    if (widgetInEditMode && selectedField) {
      updatePageLayoutWidget(widgetInEditMode.id, {
        title: selectedField.label,
      });
    }

    closeDropdown();
  };

  return (
    <>
      {isAdvancedOpen && (
        <DropdownAdvancedSectionHeader onBack={handleBackFromAdvanced} />
      )}
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
          selectableItemIdArray={availableFields.map((field) => field.id)}
        >
          {availableFields.map((fieldMetadataItem) => (
            <SelectableListItem
              key={fieldMetadataItem.id}
              itemId={fieldMetadataItem.id}
              onEnter={() => {
                handleSelectField(fieldMetadataItem.id);
              }}
            >
              <MenuItemSelect
                text={fieldMetadataItem.label}
                selected={currentFieldMetadataId === fieldMetadataItem.id}
                focused={selectedItemId === fieldMetadataItem.id}
                LeftIcon={getIcon(
                  currentFieldMetadataId === fieldMetadataItem.id
                    ? currentFieldMetadataItem?.icon
                    : fieldMetadataItem.icon,
                )}
                onClick={() => {
                  handleSelectField(fieldMetadataItem.id);
                }}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
        {shouldShowAdvanced && (
          <DropdownAdvancedSectionMenuItem onClick={handleOpenAdvanced} />
        )}
      </DropdownMenuItemsContainer>
    </>
  );
};
