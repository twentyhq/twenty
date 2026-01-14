import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { createEmptySelectGroup } from '@/page-layout/widgets/graph/utils/createEmptySelectGroup';
import { isDefined } from 'twenty-shared/utils';

type OneDimensionalFillSelectGapsParams = {
  data: GroupByRawResult[];
  selectOptions: FieldMetadataItemOption[];
  aggregateKeys: string[];
};

export const fillSelectGapsInOneDimensionalChartData = ({
  data,
  selectOptions,
  aggregateKeys,
}: OneDimensionalFillSelectGapsParams): GroupByRawResult[] => {
  const existingGroupsMap = new Map<string, GroupByRawResult>();

  for (const item of data) {
    const dimensionValue = item.groupByDimensionValues?.[0];

    if (isDefined(dimensionValue)) {
      existingGroupsMap.set(String(dimensionValue), item);
    }
  }

  const filledData: GroupByRawResult[] = selectOptions.map((option) => {
    const existingGroup = existingGroupsMap.get(option.value);

    return isDefined(existingGroup)
      ? existingGroup
      : createEmptySelectGroup([option.value], aggregateKeys);
  });

  return filledData;
};
