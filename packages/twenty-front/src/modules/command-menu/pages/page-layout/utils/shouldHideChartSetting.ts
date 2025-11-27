import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isNestedFieldDateType } from '@/page-layout/widgets/graph/utils/isNestedFieldDateType';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';

const shouldHideDateGranularityBasedOnFieldType = (
  fieldMetadataId: string | undefined | null,
  subFieldName: string | undefined | null,
  objectMetadataItem: ObjectMetadataItem,
  objectMetadataItems: ObjectMetadataItem[],
): boolean => {
  if (!isDefined(fieldMetadataId)) {
    return true;
  }

  const field = objectMetadataItem.fields.find(
    (field) => field.id === fieldMetadataId,
  );

  if (!isDefined(field)) {
    return true;
  }

  if (isFieldRelation(field) && isDefined(subFieldName)) {
    return !isNestedFieldDateType(field, subFieldName, objectMetadataItems);
  }

  return !isFieldMetadataDateKind(field.type);
};

export const shouldHideChartSetting = (
  item: ChartSettingsItem,
  objectMetadataId: string,
  isGroupByEnabled: boolean,
  configuration?: ChartConfiguration,
  objectMetadataItem?: ObjectMetadataItem,
  objectMetadataItems?: ObjectMetadataItem[],
): boolean => {
  const hasNoObjectMetadata = !isNonEmptyString(objectMetadataId);
  const dependsOnSource = item?.dependsOn?.includes(
    CHART_CONFIGURATION_SETTING_IDS.SOURCE,
  );
  const dependsOnGroupBy = item?.dependsOn?.includes(
    CHART_CONFIGURATION_SETTING_IDS.GROUP_BY,
  );

  if (isDefined(configuration) && isDefined(objectMetadataItem)) {
    if (item.id === CHART_CONFIGURATION_SETTING_IDS.DATE_GRANULARITY_X) {
      const isBarOrLineChart =
        configuration.__typename === 'BarChartConfiguration' ||
        configuration.__typename === 'LineChartConfiguration';

      if (isBarOrLineChart) {
        return shouldHideDateGranularityBasedOnFieldType(
          configuration.primaryAxisGroupByFieldMetadataId,
          configuration.primaryAxisGroupBySubFieldName,
          objectMetadataItem,
          objectMetadataItems ?? [],
        );
      }
    }

    if (item.id === CHART_CONFIGURATION_SETTING_IDS.DATE_GRANULARITY_Y) {
      const isBarOrLineChart =
        configuration.__typename === 'BarChartConfiguration' ||
        configuration.__typename === 'LineChartConfiguration';

      if (isBarOrLineChart) {
        return shouldHideDateGranularityBasedOnFieldType(
          configuration.secondaryAxisGroupByFieldMetadataId,
          configuration.secondaryAxisGroupBySubFieldName,
          objectMetadataItem,
          objectMetadataItems ?? [],
        );
      }
    }

    if (item.id === CHART_CONFIGURATION_SETTING_IDS.DATE_GRANULARITY) {
      if (configuration.__typename === 'PieChartConfiguration') {
        return shouldHideDateGranularityBasedOnFieldType(
          configuration.groupByFieldMetadataId,
          configuration.groupBySubFieldName,
          objectMetadataItem,
          objectMetadataItems ?? [],
        );
      }
    }

    if (item.id === CHART_CONFIGURATION_SETTING_IDS.SHOW_LEGEND) {
      if (configuration.__typename === 'PieChartConfiguration') {
        return false;
      }
    }
  }

  return (
    (hasNoObjectMetadata && (dependsOnSource ?? false)) ||
    (!isGroupByEnabled && (dependsOnGroupBy ?? false))
  );
};
