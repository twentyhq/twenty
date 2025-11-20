import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { formatDimensionValue } from '@/page-layout/widgets/graph/utils/formatDimensionValue';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectRecordGroupByDateGranularity } from '~/generated/graphql';

type BuildPrimaryDimensionMetadataParameters = {
  groupByRawResults: GroupByRawResult[];
  primaryAxisGroupByField: FieldMetadataItem;
  primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity;
  primaryAxisGroupBySubFieldName?: string;
};

export const buildPrimaryDimensionMetadata = ({
  groupByRawResults,
  primaryAxisGroupByField,
  primaryAxisDateGranularity,
  primaryAxisGroupBySubFieldName,
}: BuildPrimaryDimensionMetadataParameters): Map<string, RawDimensionValue> => {
  const primaryDimensionMetadata = new Map<string, RawDimensionValue>();

  groupByRawResults.forEach((rawResult) => {
    const groupByDimensionValues = rawResult.groupByDimensionValues;

    if (!isDefined(groupByDimensionValues?.[0])) {
      return;
    }

    const formattedPrimaryDimensionValue = formatDimensionValue({
      value: groupByDimensionValues[0],
      fieldMetadata: primaryAxisGroupByField,
      dateGranularity: primaryAxisDateGranularity,
      subFieldName: primaryAxisGroupBySubFieldName,
    });

    if (!primaryDimensionMetadata.has(formattedPrimaryDimensionValue)) {
      primaryDimensionMetadata.set(
        formattedPrimaryDimensionValue,
        groupByDimensionValues[0] as RawDimensionValue,
      );
    }
  });

  return primaryDimensionMetadata;
};
