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
    ? (configuration.primaryAxisGroup ?? configuration.secondaryAxisGroup)
    : (configuration.secondaryAxisGroup ?? configuration.primaryAxisGroup);

  const yFieldId = isVertical
    ? (configuration.secondaryAxisGroup ?? configuration.primaryAxisGroup)
    : (configuration.primaryAxisGroup ?? configuration.secondaryAxisGroup);

  const xSubFieldName = (
    isVertical
      ? (configuration.primaryAxisSubFieldName ??
        configuration.secondaryAxisSubFieldName)
      : (configuration.secondaryAxisSubFieldName ??
        configuration.primaryAxisSubFieldName)
  ) as CompositeFieldSubFieldName | undefined;

  const ySubFieldName = (
    isVertical
      ? (configuration.secondaryAxisSubFieldName ??
        configuration.primaryAxisSubFieldName)
      : (configuration.primaryAxisSubFieldName ??
        configuration.secondaryAxisSubFieldName)
  ) as CompositeFieldSubFieldName | undefined;

  return {
    xFieldId,
    yFieldId,
    xSubFieldName,
    ySubFieldName,
  };
};
