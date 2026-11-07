import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { CHART_SORT_DROPDOWN_PAGE } from '@/side-panel/pages/page-layout/constants/ChartSortDropdownPage';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconCheck } from 'twenty-ui/icon';
import { findFieldMetadataItemByFieldMetadataId } from '@/object-metadata/utils/findFieldMetadataItemByFieldMetadataId';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { ChartManualSortSubMenuContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartManualSortSubMenuContent';
import { X_SORT_BY_OPTIONS } from '@/side-panel/pages/page-layout/constants/XSortByOptions';
import { useGraphXSortOptionLabels } from '@/side-panel/pages/page-layout/hooks/useGraphXSortOptionLabels';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { filterSortOptionsByFieldType } from '@/side-panel/pages/page-layout/utils/filterSortOptionsByFieldType';
import { getDefaultManualSortOrder } from '@/side-panel/pages/page-layout/utils/getDefaultManualSortOrder';
import { getSortIconForFieldType } from '@/side-panel/pages/page-layout/utils/getSortIconForFieldType';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { GraphOrderBy } from '~/generated-metadata/graphql';

export const ChartSortBySelectionDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { objectMetadataItems } = useObjectMetadataItems();
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const configuration = widgetInEditMode?.configuration;

  const isPieChart = isWidgetConfigurationOfType(
    configuration,
    'PieChartConfiguration',
  );
  const isLineChart = isWidgetConfigurationOfType(
    configuration,
    'LineChartConfiguration',
  );
  const isBarChart = isWidgetConfigurationOfType(
    configuration,
    'BarChartConfiguration',
  );

  if (!isBarChart && !isLineChart && !isPieChart) {
    throw new Error(doNotTranslate('Invalid configuration type'));
  }

  if (!isDefined(widgetInEditMode?.objectMetadataId)) {
    throw new Error(doNotTranslate('No data source in chart'));
  }

  const { getXSortOptionLabel } = useGraphXSortOptionLabels({
    objectMetadataId: widgetInEditMode.objectMetadataId,
  });

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widgetInEditMode.objectMetadataId,
  );

  const currentOrderBy = isPieChart
    ? configuration.orderBy
    : configuration.primaryAxisOrderBy;
  const groupByFieldMetadataId = isPieChart
    ? configuration.groupByFieldMetadataId
    : configuration.primaryAxisGroupByFieldMetadataId;
  const groupBySubFieldName = isPieChart
    ? configuration.groupBySubFieldName
    : configuration.primaryAxisGroupBySubFieldName;

  const primaryAxisField = findFieldMetadataItemByFieldMetadataId({
    fieldMetadataItems: objectMetadataItem?.fields,
    fieldMetadataId: groupByFieldMetadataId,
  });

  if (!isDefined(primaryAxisField)) {
    return null;
  }

  const existingManualSortOrder = isPieChart
    ? configuration.manualSortOrder
    : configuration.primaryAxisManualSortOrder;

  const handleSelect = (orderBy: GraphOrderBy) => {
    const orderByKey = isPieChart ? 'orderBy' : 'primaryAxisOrderBy';
    const manualSortOrderKey = isPieChart
      ? 'manualSortOrder'
      : 'primaryAxisManualSortOrder';
    const configToUpdate: Record<string, unknown> = { [orderByKey]: orderBy };
    const shouldInitializeManualSortOrder =
      orderBy === GraphOrderBy.MANUAL && !isDefined(existingManualSortOrder);
    const shouldClearManualSortOrder =
      currentOrderBy === GraphOrderBy.MANUAL && orderBy !== GraphOrderBy.MANUAL;

    if (shouldInitializeManualSortOrder) {
      configToUpdate[manualSortOrderKey] = getDefaultManualSortOrder(
        primaryAxisField.options,
      );
    }

    if (shouldClearManualSortOrder) {
      configToUpdate[manualSortOrderKey] = null;
    }

    updateCurrentWidgetConfig({ configToUpdate });
  };

  const availableOptions = filterSortOptionsByFieldType({
    options: X_SORT_BY_OPTIONS,
    fieldType: primaryAxisField.type,
  });

  return (
    <>
      <Dropdown.Page id={CHART_SORT_DROPDOWN_PAGE.ROOT}>
        <ChartSettingsDropdownSection>
          {availableOptions.map((sortOption) => {
            const isManualOption = sortOption.value === GraphOrderBy.MANUAL;
            const isSelected = currentOrderBy === sortOption.value;
            const startIcon = (
              <SelectOptionIcon
                Icon={
                  sortOption.icon ??
                  getSortIconForFieldType({
                    fieldType: primaryAxisField.type,
                    orderBy: sortOption.value,
                  })
                }
              />
            );
            const label = (
              <OverflowingTextWithTooltip
                text={getXSortOptionLabel({
                  graphOrderBy: sortOption.value,
                  groupByFieldMetadataIdX: groupByFieldMetadataId ?? '',
                  groupBySubFieldNameX: groupBySubFieldName ?? undefined,
                  aggregateFieldMetadataId:
                    configuration.aggregateFieldMetadataId ?? undefined,
                  aggregateOperation:
                    configuration.aggregateOperation ?? undefined,
                })}
              />
            );

            if (isManualOption) {
              return (
                <Dropdown.ActionItem
                  key={sortOption.value}
                  page={CHART_SORT_DROPDOWN_PAGE.MANUAL}
                  onClick={() => handleSelect(sortOption.value)}
                  aria-current={isSelected ? 'true' : undefined}
                  startIcon={startIcon}
                  endIcon={isSelected ? <IconCheck /> : undefined}
                >
                  {label}
                </Dropdown.ActionItem>
              );
            }

            return (
              <Dropdown.OptionItem
                key={sortOption.value}
                selected={isSelected}
                onSelect={() => handleSelect(sortOption.value)}
                startIcon={startIcon}
              >
                {label}
              </Dropdown.OptionItem>
            );
          })}
        </ChartSettingsDropdownSection>
      </Dropdown.Page>
      <Dropdown.Page id={CHART_SORT_DROPDOWN_PAGE.MANUAL} type="panel">
        <ChartManualSortSubMenuContent
          fieldMetadataItem={primaryAxisField}
          axis="primary"
        />
      </Dropdown.Page>
    </>
  );
};
