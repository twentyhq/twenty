import { findChartGroupByFieldMetadataItem } from '@/page-layout/widgets/graph/utils/findChartGroupByFieldMetadataItem';
import { type BuildChartDrilldownQueryParamsInput } from '@/page-layout/widgets/graph/types/BuildChartDrilldownQueryParamsInput';
import { buildFilterFromChartBucket } from '@/page-layout/widgets/graph/utils/buildFilterFromChartBucket';
import { buildFilterQueryParams } from '@/page-layout/widgets/graph/utils/buildFilterQueryParams';
import { buildSortsFromChartConfig } from '@/page-layout/widgets/graph/utils/buildSortsFromChartConfig';
import { normalizeChartConfigurationFields } from '@/page-layout/widgets/graph/utils/normalizeChartConfigurationFields';
import { sanitizeChartRecordFilters } from '@/side-panel/pages/page-layout/utils/sanitizeChartRecordFilters';
import { isDefined } from 'twenty-shared/utils';

export const buildChartDrilldownQueryParams = ({
  objectMetadataItem,
  configuration,
  clickedData,
  viewId,
  timezone,
  firstDayOfTheWeek,
}: BuildChartDrilldownQueryParamsInput): URLSearchParams => {
  const drilldownQueryParams = new URLSearchParams();

  if (isDefined(configuration.filter)) {
    const { recordFilters, recordFilterGroups } = sanitizeChartRecordFilters({
      chartFilters: configuration.filter,
      fieldMetadataItems: objectMetadataItem.fields,
    });

    const chartFilterParams = buildFilterQueryParams({
      recordFilters,
      recordFilterGroups,
      objectMetadataItem,
    });

    chartFilterParams.forEach((value, key) => {
      drilldownQueryParams.append(key, value);
    });
  }

  const { groupByFieldMetadataId, dateGranularity, groupBySubFieldName } =
    normalizeChartConfigurationFields(configuration);

  const primaryField = isDefined(groupByFieldMetadataId)
    ? findChartGroupByFieldMetadataItem({
        fieldMetadataItems: objectMetadataItem.fields,
        groupByFieldMetadataId,
      })
    : undefined;

  if (isDefined(primaryField)) {
    const primaryFilters = buildFilterFromChartBucket({
      fieldMetadataItem: primaryField,
      bucketRawValue: clickedData.primaryBucketRawValue,
      dateGranularity,
      subFieldName: groupBySubFieldName,
      timezone,
      firstDayOfTheWeek,
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

  if (isDefined(viewId)) {
    drilldownQueryParams.set('viewId', viewId);
  }

  return drilldownQueryParams;
};
