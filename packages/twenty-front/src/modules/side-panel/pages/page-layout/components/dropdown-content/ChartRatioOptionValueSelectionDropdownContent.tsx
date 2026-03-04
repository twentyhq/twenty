import { ChartRatioOptionBooleanSelectableListItem } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartRatioOptionBooleanSelectableListItem';
import { ChartRatioOptionSelectSelectableListItem } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartRatioOptionSelectSelectableListItem';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft } from 'twenty-ui/display';
import { type ThemeColor } from 'twenty-ui/theme';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type RatioOption = {
  value: string;
  label: string;
  color?: ThemeColor;
};

export const ChartRatioOptionValueSelectionDropdownContent = ({
  currentFieldMetadataId,
  setIsOptionValueMenuOpen,
}: {
  currentFieldMetadataId: string;
  setIsOptionValueMenuOpen: (isOpen: boolean) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  if (
    !isWidgetConfigurationOfType(
      widgetInEditMode?.configuration,
      'AggregateChartConfiguration',
    )
  ) {
    return null;
  }

  const sourceObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widgetInEditMode.objectMetadataId,
  );

  const selectedField = sourceObjectMetadataItem?.fields.find(
    (field) => field.id === currentFieldMetadataId,
  );

  if (!isDefined(sourceObjectMetadataItem) || !isDefined(selectedField)) {
    return null;
  }

  const getOptionsForField = (): RatioOption[] => {
    if (selectedField.type === FieldMetadataType.BOOLEAN) {
      return [
        { value: 'true', label: t`True` },
        { value: 'false', label: t`False` },
      ];
    }

    if (
      selectedField.type === FieldMetadataType.SELECT ||
      selectedField.type === FieldMetadataType.MULTI_SELECT
    ) {
      const fieldOptions = selectedField.options ?? [];
      return fieldOptions.map((option) => ({
        value: option.value,
        label: option.label,
        color: option.color as ThemeColor,
      }));
    }

    return [];
  };

  const isBoolean = selectedField.type === FieldMetadataType.BOOLEAN;
  const options = getOptionsForField();

  const filteredOptions = filterBySearchQuery({
    items: options,
    searchQuery,
    getSearchableValues: (item) => [item.label],
  });

  return (
    <>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => setIsOptionValueMenuOpen(false)}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Select value`}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={t`Search options`}
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={filteredOptions.map((item) => item.value)}
        >
          {filteredOptions.map((option) =>
            isBoolean ? (
              <ChartRatioOptionBooleanSelectableListItem
                key={option.value}
                optionValue={option.value}
                label={option.label}
                currentFieldMetadataId={currentFieldMetadataId}
              />
            ) : (
              <ChartRatioOptionSelectSelectableListItem
                key={option.value}
                optionValue={option.value}
                label={option.label}
                color={option.color}
                currentFieldMetadataId={currentFieldMetadataId}
              />
            ),
          )}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
