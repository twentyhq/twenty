import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { ChartAggregateOperationSelectionDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartAggregateOperationSelectionDropdownContent';
import { ChartRatioOptionValueSelectionDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartRatioOptionValueSelectionDropdownContent';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { getChartAggregateDropdownPageId } from '@/side-panel/pages/page-layout/utils/getChartAggregateDropdownPageId';
import { t } from '@lingui/core/macro';
import { Fragment, useState } from 'react';
import { IconCheck, useIcons } from 'twenty-ui/icon';
import { Dropdown } from 'twenty-ui/components/navigation';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';
import { doNotTranslate } from 'twenty-shared/i18n';

export const ChartFieldSelectionForAggregateOperationDropdownContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const configuration = widgetInEditMode?.configuration;

  const isBarOrLineChart =
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration');
  const isAggregateChart = isWidgetConfigurationOfType(
    configuration,
    'AggregateChartConfiguration',
  );
  const isPieChart = isWidgetConfigurationOfType(
    configuration,
    'PieChartConfiguration',
  );

  if (!isBarOrLineChart && !isAggregateChart && !isPieChart) {
    throw new Error(doNotTranslate('Invalid configuration type'));
  }

  const currentFieldMetadataId = configuration.aggregateFieldMetadataId;

  const sourceObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widgetInEditMode?.objectMetadataId,
  );

  const availableFieldMetadataItems = (
    sourceObjectMetadataItem?.fields ?? []
  ).filter((field) => !isFieldRelation(field) && !isHiddenSystemField(field));
  const filteredFieldMetadataItems = filterBySearchQuery({
    items: availableFieldMetadataItems,
    searchQuery,
    getSearchableValues: (item) => [item.label, item.name],
  });

  const { getIcon } = useIcons();

  return (
    <>
      <Dropdown.Page id="root">
        <Dropdown.Search
          placeholder={t`Search fields`}
          aria-label={t`Search fields`}
          onValueChange={setSearchQuery}
          value={searchQuery}
        />
        <Dropdown.Separator />
        <ChartSettingsDropdownSection>
          {filteredFieldMetadataItems.map((fieldMetadataItem) => (
            <Dropdown.ActionItem
              key={fieldMetadataItem.id}
              page={getChartAggregateDropdownPageId({
                fieldMetadataId: fieldMetadataItem.id,
                page: 'operations',
              })}
              aria-current={
                currentFieldMetadataId === fieldMetadataItem.id
                  ? 'true'
                  : undefined
              }
              startIcon={
                <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
              }
              endIcon={
                currentFieldMetadataId === fieldMetadataItem.id ? (
                  <SelectOptionIcon Icon={IconCheck} />
                ) : undefined
              }
            >
              {fieldMetadataItem.label}
            </Dropdown.ActionItem>
          ))}
          {!isNonEmptyArray(filteredFieldMetadataItems) && (
            <Dropdown.Empty>{t`No fields found`}</Dropdown.Empty>
          )}
        </ChartSettingsDropdownSection>
      </Dropdown.Page>
      {availableFieldMetadataItems.map((fieldMetadataItem) => (
        <Fragment key={fieldMetadataItem.id}>
          <Dropdown.Page
            id={getChartAggregateDropdownPageId({
              fieldMetadataId: fieldMetadataItem.id,
              page: 'operations',
            })}
          >
            <ChartAggregateOperationSelectionDropdownContent
              currentFieldMetadataId={fieldMetadataItem.id}
            />
          </Dropdown.Page>
          <Dropdown.Page
            id={getChartAggregateDropdownPageId({
              fieldMetadataId: fieldMetadataItem.id,
              page: 'ratio',
            })}
          >
            <ChartRatioOptionValueSelectionDropdownContent
              currentFieldMetadataId={fieldMetadataItem.id}
            />
          </Dropdown.Page>
        </Fragment>
      ))}
    </>
  );
};
