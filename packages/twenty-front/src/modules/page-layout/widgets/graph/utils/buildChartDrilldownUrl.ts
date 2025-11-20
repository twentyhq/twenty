import { type BuildChartDrilldownUrlParams } from '@/page-layout/widgets/graph/types/BuildChartDrilldownUrlParams';
import { buildFilterFromChartBucket } from '@/page-layout/widgets/graph/utils/buildFilterFromChartBucket';
import { buildSortsFromChartConfig } from '@/page-layout/widgets/graph/utils/buildSortsFromChartConfig';
import { buildFilterQueryParams } from '@/page-layout/widgets/graph/utils/serializeFiltersToUrl';
import { isDefined } from 'twenty-shared/utils';

export const buildChartDrilldownUrl = ({
  objectMetadataItem,
  configuration,
  clickedData,
  timezone,
}: BuildChartDrilldownUrlParams): string => {
  const drilldownQueryParams = new URLSearchParams();

  // 1. Add chart filters from configuration (if any)
  if (isDefined(configuration.filter)) {
    // eslint-disable-next-line no-console
    console.log(
      '[Chart Drilldown] Chart filters being added to URL:',
      JSON.stringify({
        recordFilters: configuration.filter.recordFilters ?? [],
        recordFilterGroups: configuration.filter.recordFilterGroups ?? [],
      }),
    );

    const chartFilterParams = buildFilterQueryParams({
      recordFilters: configuration.filter.recordFilters ?? [],
      recordFilterGroups: configuration.filter.recordFilterGroups ?? [],
      objectMetadataItem,
    });

    // Merge chart filter params into drilldown params
    chartFilterParams.forEach((value, key) => {
      drilldownQueryParams.append(key, value);
    });
  }

  // 2. Add clicked dimension filter
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

  // 3. Add sorts from chart configuration
  const sorts = buildSortsFromChartConfig({
    configuration,
    objectMetadataItem,
  });

  sorts.forEach((sort) => {
    drilldownQueryParams.append(`sort[${sort.fieldName}]`, sort.direction);
  });

  const drilldownUrl = `/objects/${objectMetadataItem.namePlural}?${drilldownQueryParams.toString()}`;

  // eslint-disable-next-line no-console
  console.log('[Chart Drilldown] Final drilldown URL:', drilldownUrl);

  return drilldownUrl;
};
