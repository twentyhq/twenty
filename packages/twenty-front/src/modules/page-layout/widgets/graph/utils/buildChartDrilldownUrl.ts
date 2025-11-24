import { type BuildChartDrilldownUrlParams } from '@/page-layout/widgets/graph/types/BuildChartDrilldownUrlParams';
import { buildFilterFromChartBucket } from '@/page-layout/widgets/graph/utils/buildFilterFromChartBucket';
import { buildFilterQueryParams } from '@/page-layout/widgets/graph/utils/buildFilterQueryParams';
import { isDefined } from 'twenty-shared/utils';

export const buildChartDrilldownUrl = ({
  objectMetadataItem,
  configuration,
  clickedData,
  viewId,
  timezone,
}: BuildChartDrilldownUrlParams): string => {
  const drilldownQueryParams = new URLSearchParams();

  if (isDefined(configuration.filter)) {
    const chartFilterParams = buildFilterQueryParams({
      recordFilters: configuration.filter.recordFilters ?? [],
      recordFilterGroups: configuration.filter.recordFilterGroups ?? [],
      objectMetadataItem,
    });

    chartFilterParams.forEach((value, key) => {
      drilldownQueryParams.append(key, value);
    });
  }

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

  if (isDefined(viewId)) {
    drilldownQueryParams.set('viewId', viewId);
  }

  const drilldownUrl = `/objects/${objectMetadataItem.namePlural}?${drilldownQueryParams.toString()}`;

  return drilldownUrl;
};
