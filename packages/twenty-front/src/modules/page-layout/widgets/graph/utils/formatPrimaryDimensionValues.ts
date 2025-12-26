import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { formatDimensionValue } from '@/page-layout/widgets/graph/utils/formatDimensionValue';
import { type FirstDayOfTheWeek } from 'twenty-shared/types';
import { type ObjectRecordGroupByDateGranularity } from '~/generated/graphql';

type FormatPrimaryDimensionValuesParameters = {
  groupByRawResults: GroupByRawResult[];
  primaryAxisGroupByField: FieldMetadataItem;
  primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity;
  primaryAxisGroupBySubFieldName?: string;
  userTimezone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
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
  userTimezone,
  firstDayOfTheWeek,
}: FormatPrimaryDimensionValuesParameters): FormattedDimensionValue[] => {
  return groupByRawResults.reduce<FormattedDimensionValue[]>(
    (accumulator, rawResult) => {
      const groupByDimensionValues = rawResult.groupByDimensionValues;

      const rawPrimaryDimensionValue = (groupByDimensionValues?.[0] ??
        null) as RawDimensionValue;

      const formattedPrimaryDimensionValue = formatDimensionValue({
        value: rawPrimaryDimensionValue,
        fieldMetadata: primaryAxisGroupByField,
        dateGranularity: primaryAxisDateGranularity,
        subFieldName: primaryAxisGroupBySubFieldName,
        userTimezone,
        firstDayOfTheWeek,
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
