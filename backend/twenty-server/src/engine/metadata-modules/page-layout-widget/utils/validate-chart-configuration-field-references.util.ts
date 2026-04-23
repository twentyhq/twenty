import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { PageLayoutWidgetFieldValidationException } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget-field-validation.exception';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { findActiveFlatFieldMetadataById } from 'src/engine/metadata-modules/page-layout-widget/utils/find-active-flat-field-metadata-by-id.util';
import { isChartReferencingFieldInConfiguration } from 'src/engine/metadata-modules/page-layout-widget/utils/is-chart-referencing-field-in-configuration.util';
import { validateGroupByFieldOrThrow } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-group-by-field.util';

const buildChartFieldValidationException = (
  message: string,
  widgetTitle?: string | null,
): PageLayoutWidgetException => {
  const prefix = isDefined(widgetTitle) ? `Chart "${widgetTitle}": ` : '';
  const fullMessage = prefix + message;

  return new PageLayoutWidgetException(
    fullMessage,
    PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    {
      userFriendlyMessage: msg`${fullMessage}`,
    },
  );
};

const validateGroupByFieldAsChartFieldOrThrow = (
  params: Parameters<typeof validateGroupByFieldOrThrow>[0],
  widgetTitle?: string | null,
): void => {
  try {
    validateGroupByFieldOrThrow(params);
  } catch (error) {
    if (!(error instanceof PageLayoutWidgetFieldValidationException)) {
      throw error;
    }

    throw buildChartFieldValidationException(error.message, widgetTitle);
  }
};

export const validateChartConfigurationFieldReferencesOrThrow = ({
  widgetConfiguration,
  widgetObjectMetadataId,
  widgetTitle,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  widgetConfiguration?: AllPageLayoutWidgetConfiguration | null;
  widgetObjectMetadataId?: string | null;
  widgetTitle?: string | null;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): void => {
  if (!isDefined(widgetConfiguration)) {
    return;
  }

  if (!isChartReferencingFieldInConfiguration(widgetConfiguration)) {
    return;
  }

  if (!isDefined(widgetObjectMetadataId)) {
    throw buildChartFieldValidationException(
      'objectMetadataId is required for graph widgets.',
      widgetTitle,
    );
  }

  const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: widgetObjectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(objectMetadata) || !objectMetadata.isActive) {
    throw buildChartFieldValidationException(
      `objectMetadataId "${widgetObjectMetadataId}" not found.`,
      widgetTitle,
    );
  }

  const allFields = Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter((field) => field.isActive);

  const fieldsByObjectId = new Map<string, FlatFieldMetadata[]>();

  allFields.forEach((field) => {
    const existing = fieldsByObjectId.get(field.objectMetadataId) ?? [];

    existing.push(field);
    fieldsByObjectId.set(field.objectMetadataId, existing);
  });

  const aggregateField = findActiveFlatFieldMetadataById(
    widgetConfiguration.aggregateFieldMetadataId,
    flatFieldMetadataMaps,
  );

  if (!isDefined(aggregateField)) {
    throw buildChartFieldValidationException(
      `aggregateFieldMetadataId "${widgetConfiguration.aggregateFieldMetadataId}" not found.`,
      widgetTitle,
    );
  }

  if (aggregateField.objectMetadataId !== widgetObjectMetadataId) {
    throw buildChartFieldValidationException(
      `aggregateFieldMetadataId must belong to objectMetadataId "${widgetObjectMetadataId}".`,
      widgetTitle,
    );
  }

  switch (widgetConfiguration.configurationType) {
    case WidgetConfigurationType.BAR_CHART:
    case WidgetConfigurationType.LINE_CHART: {
      validateGroupByFieldAsChartFieldOrThrow(
        {
          fieldId: widgetConfiguration.primaryAxisGroupByFieldMetadataId,
          subFieldName: widgetConfiguration.primaryAxisGroupBySubFieldName,
          paramName: 'primaryAxisGroupByFieldMetadataId',
          objectMetadataId: widgetObjectMetadataId,
          flatFieldMetadataMaps,
          allFields,
          fieldsByObjectId,
        },
        widgetTitle,
      );

      if (isDefined(widgetConfiguration.secondaryAxisGroupBySubFieldName)) {
        if (
          !isDefined(widgetConfiguration.secondaryAxisGroupByFieldMetadataId)
        ) {
          throw buildChartFieldValidationException(
            'secondaryAxisGroupByFieldMetadataId is required when secondaryAxisGroupBySubFieldName is provided.',
            widgetTitle,
          );
        }
      }

      if (isDefined(widgetConfiguration.secondaryAxisGroupByFieldMetadataId)) {
        validateGroupByFieldAsChartFieldOrThrow(
          {
            fieldId: widgetConfiguration.secondaryAxisGroupByFieldMetadataId,
            subFieldName: widgetConfiguration.secondaryAxisGroupBySubFieldName,
            paramName: 'secondaryAxisGroupByFieldMetadataId',
            objectMetadataId: widgetObjectMetadataId,
            flatFieldMetadataMaps,
            allFields,
            fieldsByObjectId,
          },
          widgetTitle,
        );
      }
      break;
    }
    case WidgetConfigurationType.PIE_CHART: {
      validateGroupByFieldAsChartFieldOrThrow(
        {
          fieldId: widgetConfiguration.groupByFieldMetadataId,
          subFieldName: widgetConfiguration.groupBySubFieldName,
          paramName: 'groupByFieldMetadataId',
          objectMetadataId: widgetObjectMetadataId,
          flatFieldMetadataMaps,
          allFields,
          fieldsByObjectId,
        },
        widgetTitle,
      );
      break;
    }
    case WidgetConfigurationType.AGGREGATE_CHART:
    default:
      break;
  }

  if (isDefined(widgetConfiguration.filter?.recordFilters)) {
    for (const recordFilter of widgetConfiguration.filter.recordFilters) {
      const filterField = findActiveFlatFieldMetadataById(
        recordFilter.fieldMetadataId,
        flatFieldMetadataMaps,
      );

      if (!isDefined(filterField)) {
        const inactiveOrMissingField = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: recordFilter.fieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        });

        const fieldLabel = inactiveOrMissingField
          ? `"${inactiveOrMissingField.label}"`
          : `field id "${recordFilter.fieldMetadataId}"`;

        throw buildChartFieldValidationException(
          `One of the chart filters uses ${fieldLabel}, but it was deleted. Please remove or replace this filter rule.`,
          widgetTitle,
        );
      }

      if (filterField.objectMetadataId !== widgetObjectMetadataId) {
        throw buildChartFieldValidationException(
          `Filter field "${recordFilter.fieldMetadataId}" must belong to objectMetadataId "${widgetObjectMetadataId}".`,
          widgetTitle,
        );
      }
    }
  }
};
