import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type FillSelectGapsResult } from '@/page-layout/widgets/graph/types/FillSelectGapsResult';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { createEmptySelectGroup } from '@/page-layout/widgets/graph/utils/createEmptySelectGroup';
import { isDefined } from 'twenty-shared/utils';

type TwoDimensionalFillSelectGapsParams = {
  data: GroupByRawResult[];
  selectOptions: FieldMetadataItemOption[];
  aggregateKeys: string[];
};

export const fillSelectGapsInTwoDimensionalChartData = ({
  data,
  selectOptions,
  aggregateKeys,
}: TwoDimensionalFillSelectGapsParams): FillSelectGapsResult => {
  const existingGroupsMap = new Map<string, GroupByRawResult>();
  const uniqueSecondDimensionValues = new Set<string | null>();

  for (const item of data) {
    const primaryDimensionValue = item.groupByDimensionValues?.[0];

    if (!isDefined(primaryDimensionValue)) {
      continue;
    }

    const secondDimensionValue = (item.groupByDimensionValues?.[1] ?? null) as
      | string
      | null;
    uniqueSecondDimensionValues.add(secondDimensionValue);

    const key = `${String(primaryDimensionValue)}_${String(secondDimensionValue)}`;
    existingGroupsMap.set(key, item);
  }

  const filledData = selectOptions.flatMap((option) =>
    Array.from(uniqueSecondDimensionValues).map((secondDimensionValue) => {
      const key = `${option.value}_${String(secondDimensionValue)}`;
      const existingGroup = existingGroupsMap.get(key);

      return isDefined(existingGroup)
        ? existingGroup
        : createEmptySelectGroup(
            [option.value, secondDimensionValue],
            aggregateKeys,
          );
    }),
  );

  return { data: filledData };
};
