import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type FillSelectGapsResult } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/FillSelectGapsResult';
import { createEmptySelectGroup } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/createEmptySelectGroup';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { isDefined } from 'twenty-shared/utils';

type OneDimensionalFillSelectGapsParams = {
  data: GroupByRawResult[];
  selectOptions: FieldMetadataItemOption[];
  aggregateKeys: string[];
};

export const fillSelectGapsInOneDimensionalBarChartData = ({
  data,
  selectOptions,
  aggregateKeys,
}: OneDimensionalFillSelectGapsParams): FillSelectGapsResult => {
  const existingGroupsMap = new Map<string, GroupByRawResult>();

  for (const item of data) {
    const dimensionValue = item.groupByDimensionValues?.[0];

    if (isDefined(dimensionValue)) {
      existingGroupsMap.set(String(dimensionValue), item);
    }
  }

  const sortedOptions = [...selectOptions].sort(
    (a, b) => a.position - b.position,
  );

  const filledData: GroupByRawResult[] = sortedOptions.map((option) => {
    const existingGroup = existingGroupsMap.get(option.value);

    return isDefined(existingGroup)
      ? existingGroup
      : createEmptySelectGroup([option.value], aggregateKeys);
  });

  return { data: filledData };
};
