import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { fillSelectGapsInOneDimensionalChartData } from '@/page-layout/widgets/graph/utils/fillSelectGapsInOneDimensionalChartData';
import { fillSelectGapsInTwoDimensionalChartData } from '@/page-layout/widgets/graph/utils/fillSelectGapsInTwoDimensionalChartData';
import { isDefined } from 'twenty-shared/utils';

type FillSelectGapsParams = {
  data: GroupByRawResult[];
  selectOptions: FieldMetadataItemOption[] | null | undefined;
  aggregateKeys: string[];
  hasSecondDimension?: boolean;
};

export const fillSelectGapsInChartData = ({
  data,
  selectOptions,
  aggregateKeys,
  hasSecondDimension = false,
}: FillSelectGapsParams): GroupByRawResult[] => {
  if (
    !isDefined(selectOptions) ||
    selectOptions.length === 0 ||
    data.length === 0
  ) {
    return data;
  }

  return hasSecondDimension
    ? fillSelectGapsInTwoDimensionalChartData({
        data,
        selectOptions,
        aggregateKeys,
      })
    : fillSelectGapsInOneDimensionalChartData({
        data,
        selectOptions,
        aggregateKeys,
      });
};
