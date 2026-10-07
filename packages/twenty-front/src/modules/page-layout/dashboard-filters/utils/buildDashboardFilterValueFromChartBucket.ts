import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isChartBucketFieldCrossFilterable } from '@/page-layout/dashboard-filters/utils/isChartBucketFieldCrossFilterable';
import { buildFilterFromChartBucket } from '@/page-layout/widgets/graph/utils/buildFilterFromChartBucket';
import { isNonEmptyString } from '@sniptt/guards';
import {
  type DashboardFilterValue,
  type ObjectRecordGroupByDateGranularity,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type BuildDashboardFilterValueFromChartBucketArgs = {
  fieldMetadataItem: FieldMetadataItem;
  bucketRawValue: unknown;
  dateGranularity?: ObjectRecordGroupByDateGranularity | null;
  subFieldName?: string | null;
};

export const buildDashboardFilterValueFromChartBucket = ({
  fieldMetadataItem,
  bucketRawValue,
  dateGranularity,
  subFieldName,
}: BuildDashboardFilterValueFromChartBucketArgs):
  | DashboardFilterValue
  | undefined => {
  if (!isChartBucketFieldCrossFilterable({ fieldMetadataItem, subFieldName })) {
    return undefined;
  }

  // The drilldown skips relation buckets, so their value is built here: the raw value is the related record id,
  // stored the way the chip's record picker stores a pick.
  if (isFieldRelation(fieldMetadataItem)) {
    if (
      !isDefined(bucketRawValue) ||
      !isNonEmptyString(String(bucketRawValue))
    ) {
      return undefined;
    }

    return {
      operand: ViewFilterOperand.IS,
      value: JSON.stringify({
        isCurrentWorkspaceMemberSelected: false,
        selectedRecordIds: [String(bucketRawValue)],
      }),
    };
  }

  const bucketFilters = buildFilterFromChartBucket({
    fieldMetadataItem,
    bucketRawValue,
    dateGranularity,
    subFieldName,
  });

  if (bucketFilters.length !== 1) {
    return undefined;
  }

  const [bucketFilter] = bucketFilters;

  // The empty bucket is IS_EMPTY, which the slot could hold but the chip inputs cannot show for every type.
  if (bucketFilter.operand !== ViewFilterOperand.IS) {
    return undefined;
  }

  return {
    operand: bucketFilter.operand,
    value: bucketFilter.value,
  };
};
