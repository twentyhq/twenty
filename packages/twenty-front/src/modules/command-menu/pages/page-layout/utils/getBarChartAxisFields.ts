import { type CompositeFieldSubFieldName } from 'twenty-shared/types';
import { GraphType, type BarChartConfiguration } from '~/generated/graphql';

type BarChartAxisFields = {
  xFieldId: string | undefined;
  yFieldId: string | undefined;
  xSubFieldName: CompositeFieldSubFieldName | undefined;
  ySubFieldName: CompositeFieldSubFieldName | undefined;
};

export const getBarChartAxisFields = (
  configuration: BarChartConfiguration,
): BarChartAxisFields => {
  if (!('graphType' in configuration)) {
    return {
      xFieldId: undefined,
      yFieldId: undefined,
      xSubFieldName: undefined,
      ySubFieldName: undefined,
    };
  }

  const isVertical = configuration.graphType === GraphType.VERTICAL_BAR;

  const xFieldId = isVertical
    ? (configuration.primaryAxisGroupByFieldMetadataId ??
      configuration.secondaryAxisGroupByFieldMetadataId)
    : (configuration.secondaryAxisGroupByFieldMetadataId ??
      configuration.primaryAxisGroupByFieldMetadataId);

  const yFieldId = isVertical
    ? (configuration.secondaryAxisGroupByFieldMetadataId ??
      configuration.primaryAxisGroupByFieldMetadataId)
    : (configuration.primaryAxisGroupByFieldMetadataId ??
      configuration.secondaryAxisGroupByFieldMetadataId);

  const xSubFieldName = (
    isVertical
      ? (configuration.primaryAxisGroupBySubFieldName ??
        configuration.secondaryAxisGroupBySubFieldName)
      : (configuration.secondaryAxisGroupBySubFieldName ??
        configuration.primaryAxisGroupBySubFieldName)
  ) as CompositeFieldSubFieldName | undefined;

  const ySubFieldName = (
    isVertical
      ? (configuration.secondaryAxisGroupBySubFieldName ??
        configuration.primaryAxisGroupBySubFieldName)
      : (configuration.primaryAxisGroupBySubFieldName ??
        configuration.secondaryAxisGroupBySubFieldName)
  ) as CompositeFieldSubFieldName | undefined;

  return {
    xFieldId,
    yFieldId,
    xSubFieldName,
    ySubFieldName,
  };
};
