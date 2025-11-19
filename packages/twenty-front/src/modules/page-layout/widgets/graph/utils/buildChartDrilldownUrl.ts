import { type BuildChartDrilldownUrlParams } from '@/page-layout/widgets/graph/types/BuildChartDrilldownUrlParams';
import { buildFilterFromChartBucket } from '@/page-layout/widgets/graph/utils/buildFilterFromChartBucket';
import { buildSortsFromChartConfig } from '@/page-layout/widgets/graph/utils/buildSortsFromChartConfig';
import { isDefined } from 'twenty-shared/utils';

export const buildChartDrilldownUrl = ({
  objectMetadataItem,
  configuration,
  clickedData,
  timezone,
}: BuildChartDrilldownUrlParams): string => {
  const drilldownQueryParams = new URLSearchParams();

  const primaryField = objectMetadataItem.fields.find(
    (field) => field.id === configuration.primaryAxisGroupByFieldMetadataId,
  );

  if (isDefined(primaryField)) {
    const primaryFilters = buildFilterFromChartBucket({
      fieldMetadataItem: primaryField,
      bucketRawValue: clickedData.primaryBucketRawValue,
      dateGranularity: configuration.primaryAxisDateGranularity,
      subFieldName: configuration.primaryAxisGroupBySubFieldName,
      timezone,
    });

    primaryFilters.forEach((filter) => {
      drilldownQueryParams.append(
        `filter[${filter.fieldName}][${filter.operand}]`,
        filter.value,
      );
    });
  }

  const sorts = buildSortsFromChartConfig({
    configuration,
    objectMetadataItem,
  });

  sorts.forEach((sort) => {
    drilldownQueryParams.append(`sort[${sort.fieldName}]`, sort.direction);
  });

  const drilldownUrl = `/objects/${objectMetadataItem.namePlural}?${drilldownQueryParams.toString()}`;

  return drilldownUrl;
};
