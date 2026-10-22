import { ChartRatioOptionBooleanSelectableListItem } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartRatioOptionBooleanSelectableListItem';
import { ChartRatioOptionSelectSelectableListItem } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartRatioOptionSelectSelectableListItem';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { type ThemeColor } from 'twenty-ui/theme';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type RatioOption = {
  value: string;
  label: string;
  color?: ThemeColor;
};

type ChartRatioOptionValueSelectionDropdownContentProps = {
  currentFieldMetadataId: string;
};

export const ChartRatioOptionValueSelectionDropdownContent = ({
  currentFieldMetadataId,
}: ChartRatioOptionValueSelectionDropdownContentProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

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
      <Dropdown.Back aria-label={t`Back to operations`}>
        {t`Select value`}
      </Dropdown.Back>
      <Dropdown.Search
        placeholder={t`Search options`}
        aria-label={t`Search options`}
        onValueChange={setSearchQuery}
        value={searchQuery}
      />
      <Dropdown.Separator />
      <ChartSettingsDropdownSection>
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
        {!isNonEmptyArray(filteredOptions) && (
          <Dropdown.Empty>{t`No options found`}</Dropdown.Empty>
        )}
      </ChartSettingsDropdownSection>
    </>
  );
};
