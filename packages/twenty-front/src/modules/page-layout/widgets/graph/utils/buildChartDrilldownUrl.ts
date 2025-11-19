import { type BuildChartDrilldownUrlParams } from '@/page-layout/widgets/graph/types/BuildChartDrilldownUrlParams';
import { buildFilterFromChartBucket } from '@/page-layout/widgets/graph/utils/buildFilterFromChartBucket';
import { buildGroupsFromChartConfig } from '@/page-layout/widgets/graph/utils/buildGroupsFromChartConfig';
import { buildSortsFromChartConfig } from '@/page-layout/widgets/graph/utils/buildSortsFromChartConfig';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const buildChartDrilldownUrl = ({
  objectMetadataItem,
  configuration,
  clickedData,
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
    });

    primaryFilters.forEach((filter) => {
      drilldownQueryParams.append(
        `filter[${filter.fieldName}][${filter.operand}]`,
        filter.value,
      );
    });
  }

  if (
    isDefined(configuration.secondaryAxisGroupByFieldMetadataId) &&
    configuration.secondaryAxisGroupByFieldMetadataId !==
      configuration.primaryAxisGroupByFieldMetadataId &&
    isNonEmptyString(clickedData.secondaryBucketValue)
  ) {
    const secondaryField = objectMetadataItem.fields.find(
      (field) => field.id === configuration.secondaryAxisGroupByFieldMetadataId,
    );

    if (isDefined(secondaryField)) {
      const secondaryFilters = buildFilterFromChartBucket({
        fieldMetadataItem: secondaryField,
        bucketRawValue: clickedData.secondaryBucketValue,
        dateGranularity: configuration.secondaryAxisGroupByDateGranularity,
        subFieldName: configuration.secondaryAxisGroupBySubFieldName,
      });

      secondaryFilters.forEach((filter) => {
        drilldownQueryParams.append(
          `filter[${filter.fieldName}][${filter.operand}]`,
          filter.value,
        );
      });
    }
  }

  const sorts = buildSortsFromChartConfig({
    configuration,
    objectMetadataItem,
  });

  sorts.forEach((sort) => {
    drilldownQueryParams.append(`sort[${sort.fieldName}]`, sort.direction);
  });

  const groups = buildGroupsFromChartConfig({
    configuration,
    objectMetadataItem,
  });

  groups.forEach((group) => {
    drilldownQueryParams.append(`group[${group.fieldName}]`, group.fieldValue);
  });

  const drilldownUrl = `/objects/${objectMetadataItem.namePlural}?${drilldownQueryParams.toString()}`;

  return drilldownUrl;
};
