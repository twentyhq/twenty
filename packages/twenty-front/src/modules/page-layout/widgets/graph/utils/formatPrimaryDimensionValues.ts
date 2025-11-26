import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { formatDimensionValue } from '@/page-layout/widgets/graph/utils/formatDimensionValue';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectRecordGroupByDateGranularity } from '~/generated/graphql';

type FormatPrimaryDimensionValuesParameters = {
  groupByRawResults: GroupByRawResult[];
  primaryAxisGroupByField: FieldMetadataItem;
  primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity;
  primaryAxisGroupBySubFieldName?: string;
};

export type FormattedDimensionValue = {
  formattedPrimaryDimensionValue: string;
  rawPrimaryDimensionValue: RawDimensionValue;
};

export const formatPrimaryDimensionValues = ({
  groupByRawResults,
  primaryAxisGroupByField,
  primaryAxisDateGranularity,
  primaryAxisGroupBySubFieldName,
}: FormatPrimaryDimensionValuesParameters): FormattedDimensionValue[] => {
  return groupByRawResults.reduce<FormattedDimensionValue[]>(
    (accumulator, rawResult) => {
      const groupByDimensionValues = rawResult.groupByDimensionValues;

      if (!isDefined(groupByDimensionValues?.[0])) {
        return accumulator;
      }

      const rawPrimaryDimensionValue =
        groupByDimensionValues[0] as RawDimensionValue;

      const formattedPrimaryDimensionValue = formatDimensionValue({
        value: rawPrimaryDimensionValue,
        fieldMetadata: primaryAxisGroupByField,
        dateGranularity: primaryAxisDateGranularity,
        subFieldName: primaryAxisGroupBySubFieldName,
      });

      return [
        ...accumulator,
        {
          formattedPrimaryDimensionValue,
          rawPrimaryDimensionValue,
        },
      ];
    },
    [],
  );
};
