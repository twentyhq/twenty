import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';

type ChartGroup = {
  fieldName: string;
  fieldValue: string;
};

type BuildGroupsFromChartConfigParams = {
  configuration: BarChartConfiguration | LineChartConfiguration;
  objectMetadataItem: ObjectMetadataItem;
};

export const buildGroupsFromChartConfig = ({
  configuration,
  objectMetadataItem,
}: BuildGroupsFromChartConfigParams): ChartGroup[] => {
  if (!isDefined(configuration.primaryAxisGroupByFieldMetadataId)) {
    return [];
  }

  const primaryGroupField = objectMetadataItem.fields.find(
    (field) => field.id === configuration.primaryAxisGroupByFieldMetadataId,
  );

  if (!isDefined(primaryGroupField)) {
    return [];
  }

  return [
    {
      fieldName: primaryGroupField.name,
      fieldValue: 'true',
    },
  ];
};
