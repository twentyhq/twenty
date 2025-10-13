import { getBarChartAxisFields } from '@/command-menu/pages/page-layout/utils/getBarChartAxisFields';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type CompositeFieldSubFieldName } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';

type ChartFieldMappings = {
  xField: FieldMetadataItem | undefined;
  yField: FieldMetadataItem | undefined;
  xFieldId: BarChartConfiguration['primaryAxisGroupByFieldMetadataId'];
  yFieldId: BarChartConfiguration['secondaryAxisGroupByFieldMetadataId'];
  xSubFieldName: BarChartConfiguration['primaryAxisGroupBySubFieldName'];
  ySubFieldName: BarChartConfiguration['secondaryAxisGroupBySubFieldName'];
  xOrderBy: BarChartConfiguration['primaryAxisOrderBy'];
  yOrderBy: BarChartConfiguration['secondaryAxisOrderBy'];
};

export const getChartFieldMappings = (
  configuration: BarChartConfiguration | LineChartConfiguration,
  objectMetadataItem: ObjectMetadataItem | undefined,
): ChartFieldMappings => {
  if (configuration.__typename === 'BarChartConfiguration') {
    return getBarChartFieldMappings(configuration, objectMetadataItem);
  }

  if (configuration.__typename === 'LineChartConfiguration') {
    return getLineChartFieldMappings(configuration, objectMetadataItem);
  }

  return {
    xField: undefined,
    yField: undefined,
    xFieldId: undefined,
    yFieldId: undefined,
    xSubFieldName: undefined,
    ySubFieldName: undefined,
    xOrderBy: undefined,
    yOrderBy: undefined,
  };
};

const getBarChartFieldMappings = (
  configuration: BarChartConfiguration,
  objectMetadataItem: ObjectMetadataItem | undefined,
): ChartFieldMappings => {
  const axisFields = getBarChartAxisFields(configuration);

  const primaryField = isDefined(
    configuration.primaryAxisGroupByFieldMetadataId,
  )
    ? objectMetadataItem?.fields.find(
        (field) => field.id === configuration.primaryAxisGroupByFieldMetadataId,
      )
    : undefined;

  const secondaryField = isDefined(
    configuration.secondaryAxisGroupByFieldMetadataId,
  )
    ? objectMetadataItem?.fields.find(
        (field) =>
          field.id === configuration.secondaryAxisGroupByFieldMetadataId,
      )
    : undefined;

  const xField =
    axisFields.xFieldId === configuration.primaryAxisGroupByFieldMetadataId
      ? (primaryField ?? secondaryField)
      : (secondaryField ?? primaryField);

  const yField =
    axisFields.yFieldId === configuration.secondaryAxisGroupByFieldMetadataId
      ? (secondaryField ?? primaryField)
      : (primaryField ?? secondaryField);

  return {
    xField,
    yField,
    xFieldId: axisFields.xFieldId,
    yFieldId: axisFields.yFieldId,
    xSubFieldName: axisFields.xSubFieldName,
    ySubFieldName: axisFields.ySubFieldName,
    xOrderBy: configuration.primaryAxisOrderBy,
    yOrderBy: configuration.secondaryAxisOrderBy,
  };
};

const getLineChartFieldMappings = (
  configuration: LineChartConfiguration,
  objectMetadataItem: ObjectMetadataItem | undefined,
): ChartFieldMappings => {
  const primaryField = isDefined(
    configuration.primaryAxisGroupByFieldMetadataId,
  )
    ? objectMetadataItem?.fields.find(
        (field) => field.id === configuration.primaryAxisGroupByFieldMetadataId,
      )
    : undefined;

  const secondaryField = isDefined(
    configuration.secondaryAxisGroupByFieldMetadataId,
  )
    ? objectMetadataItem?.fields.find(
        (field) =>
          field.id === configuration.secondaryAxisGroupByFieldMetadataId,
      )
    : undefined;

  return {
    xField: primaryField,
    yField: secondaryField,
    xFieldId: configuration.primaryAxisGroupByFieldMetadataId,
    yFieldId: configuration.secondaryAxisGroupByFieldMetadataId,
    xSubFieldName: configuration.primaryAxisGroupBySubFieldName as
      | CompositeFieldSubFieldName
      | undefined,
    ySubFieldName: configuration.secondaryAxisGroupBySubFieldName as
      | CompositeFieldSubFieldName
      | undefined,
    xOrderBy: configuration.primaryAxisOrderBy,
    yOrderBy: configuration.secondaryAxisOrderBy,
  };
};
