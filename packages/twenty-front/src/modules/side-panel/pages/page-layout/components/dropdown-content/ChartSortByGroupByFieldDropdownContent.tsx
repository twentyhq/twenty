import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { CHART_SORT_DROPDOWN_PAGE } from '@/side-panel/pages/page-layout/constants/ChartSortDropdownPage';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconCheck } from 'twenty-ui/icon';
import { findFieldMetadataItemByFieldMetadataId } from '@/object-metadata/utils/findFieldMetadataItemByFieldMetadataId';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { ChartManualSortSubMenuContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartManualSortSubMenuContent';
import { AGGREGATE_SORT_BY_OPTIONS } from '@/side-panel/pages/page-layout/constants/AggregateSortByOptions';
import { useGraphGroupBySortOptionLabels } from '@/side-panel/pages/page-layout/hooks/useGraphGroupBySortOptionLabels';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { filterSortOptionsByFieldType } from '@/side-panel/pages/page-layout/utils/filterSortOptionsByFieldType';
import { getDefaultManualSortOrder } from '@/side-panel/pages/page-layout/utils/getDefaultManualSortOrder';
import { getSortIconForFieldType } from '@/side-panel/pages/page-layout/utils/getSortIconForFieldType';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  GraphOrderBy,
  type GraphOrderBy as GraphOrderByType,
} from '~/generated-metadata/graphql';

export const ChartSortByGroupByFieldDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { objectMetadataItems } = useObjectMetadataItems();
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const configuration = widgetInEditMode?.configuration;

  const isBarOrLineChart =
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration');

  if (!isBarOrLineChart) {
    throw new Error(doNotTranslate('Invalid configuration type'));
  }

  if (!isDefined(widgetInEditMode?.objectMetadataId)) {
    throw new Error(doNotTranslate('No data source in chart'));
  }

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widgetInEditMode.objectMetadataId,
  );

  const secondaryAxisField = isDefined(
    configuration.secondaryAxisGroupByFieldMetadataId,
  )
    ? findFieldMetadataItemByFieldMetadataId({
        fieldMetadataItems: objectMetadataItem?.fields,
        fieldMetadataId: configuration.secondaryAxisGroupByFieldMetadataId,
      })
    : undefined;

  const { getGroupBySortOptionLabel } = useGraphGroupBySortOptionLabels({
    objectMetadataId: widgetInEditMode.objectMetadataId,
  });

  if (!isDefined(secondaryAxisField)) {
    return null;
  }

  const handleSelectSortOption = (orderBy: GraphOrderByType) => {
    const configToUpdate: Record<string, unknown> = {
      secondaryAxisOrderBy: orderBy,
    };
    const shouldInitializeManualSortOrder =
      orderBy === GraphOrderBy.MANUAL &&
      !isDefined(configuration.secondaryAxisManualSortOrder);
    const shouldClearManualSortOrder =
      configuration.secondaryAxisOrderBy === GraphOrderBy.MANUAL &&
      orderBy !== GraphOrderBy.MANUAL;

    if (shouldInitializeManualSortOrder) {
      configToUpdate.secondaryAxisManualSortOrder = getDefaultManualSortOrder(
        secondaryAxisField.options,
      );
    }

    if (shouldClearManualSortOrder) {
      configToUpdate.secondaryAxisManualSortOrder = null;
    }

    updateCurrentWidgetConfig({ configToUpdate });
  };

  const availableOptions = filterSortOptionsByFieldType({
    options: AGGREGATE_SORT_BY_OPTIONS,
    fieldType: secondaryAxisField.type,
  });

  return (
    <>
      <Dropdown.Page id={CHART_SORT_DROPDOWN_PAGE.ROOT}>
        <ChartSettingsDropdownSection>
          {availableOptions.map((sortOption) => {
            const isManualOption = sortOption.value === GraphOrderBy.MANUAL;
            const isSelected =
              configuration.secondaryAxisOrderBy === sortOption.value;
            const startIcon = (
              <SelectOptionIcon
                Icon={
                  sortOption.icon ??
                  getSortIconForFieldType({
                    fieldType: secondaryAxisField.type,
                    orderBy: sortOption.value,
                  })
                }
              />
            );
            const label = (
              <OverflowingTextWithTooltip
                text={getGroupBySortOptionLabel({
                  graphOrderBy: sortOption.value,
                  groupByFieldMetadataId:
                    configuration.secondaryAxisGroupByFieldMetadataId ?? '',
                })}
              />
            );

            if (isManualOption) {
              return (
                <Dropdown.ActionItem
                  key={sortOption.value}
                  page={CHART_SORT_DROPDOWN_PAGE.MANUAL}
                  onClick={() => handleSelectSortOption(sortOption.value)}
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
                onSelect={() => handleSelectSortOption(sortOption.value)}
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
          fieldMetadataItem={secondaryAxisField}
          axis="secondary"
        />
      </Dropdown.Page>
    </>
  );
};
