import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isRelationNestedFieldDateKind } from '@/page-layout/widgets/graph/utils/isRelationNestedFieldDateKind';
import { isNonEmptyString } from '@sniptt/guards';
import {
  isDefined,
  isFieldMetadataArrayKind,
  isFieldMetadataDateKind,
} from 'twenty-shared/utils';

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
    return !isRelationNestedFieldDateKind({
      relationField: field,
      relationNestedFieldName: subFieldName,
      objectMetadataItems: objectMetadataItems ?? [],
    });
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
    const isBarOrLineChart =
      isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
      isWidgetConfigurationOfType(configuration, 'LineChartConfiguration');

    if (item.id === CHART_CONFIGURATION_SETTING_IDS.DATE_GRANULARITY_X) {
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
      if (isWidgetConfigurationOfType(configuration, 'PieChartConfiguration')) {
        return shouldHideDateGranularityBasedOnFieldType(
          configuration.groupByFieldMetadataId,
          configuration.groupBySubFieldName,
          objectMetadataItem,
          objectMetadataItems ?? [],
        );
      }
    }

    if (item.id === CHART_CONFIGURATION_SETTING_IDS.CUMULATIVE) {
      if (isBarOrLineChart) {
        return shouldHideDateGranularityBasedOnFieldType(
          configuration.primaryAxisGroupByFieldMetadataId,
          configuration.primaryAxisGroupBySubFieldName,
          objectMetadataItem,
          objectMetadataItems ?? [],
        );
      }
    }

    if (
      item.id === CHART_CONFIGURATION_SETTING_IDS.SPLIT_MULTI_VALUE_FIELDS_X ||
      item.id === CHART_CONFIGURATION_SETTING_IDS.SPLIT_MULTI_VALUE_FIELDS_Y
    ) {
      const isXAxis =
        item.id === CHART_CONFIGURATION_SETTING_IDS.SPLIT_MULTI_VALUE_FIELDS_X;

      let fieldMetadataId: string | null | undefined;

      if (isBarOrLineChart) {
        fieldMetadataId = isXAxis
          ? configuration.primaryAxisGroupByFieldMetadataId
          : configuration.secondaryAxisGroupByFieldMetadataId;
      } else if (
        isWidgetConfigurationOfType(configuration, 'PieChartConfiguration')
      ) {
        fieldMetadataId = isXAxis
          ? configuration.groupByFieldMetadataId
          : undefined;
      }

      if (!isDefined(fieldMetadataId)) {
        return true;
      }

      if (isBarOrLineChart) {
        const primaryField = objectMetadataItem.fields.find(
          (field) =>
            field.id === configuration.primaryAxisGroupByFieldMetadataId,
        );
        const secondaryField = objectMetadataItem.fields.find(
          (field) =>
            field.id === configuration.secondaryAxisGroupByFieldMetadataId,
        );
        const bothAxesAreArrayFields =
          isDefined(primaryField) &&
          isFieldMetadataArrayKind(primaryField.type) &&
          isDefined(secondaryField) &&
          isFieldMetadataArrayKind(secondaryField.type);

        if (bothAxesAreArrayFields === true) {
          return true;
        }
      }

      const groupByField = objectMetadataItem.fields.find(
        (field) => field.id === fieldMetadataId,
      );

      return (
        !isDefined(groupByField) || !isFieldMetadataArrayKind(groupByField.type)
      );
    }

    if (item.id === CHART_CONFIGURATION_SETTING_IDS.SHOW_LEGEND) {
      if (isWidgetConfigurationOfType(configuration, 'PieChartConfiguration')) {
        return false;
      }
    }
  }

  return (
    (hasNoObjectMetadata && (dependsOnSource ?? false)) ||
    (!isGroupByEnabled && (dependsOnGroupBy ?? false))
  );
};
