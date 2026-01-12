import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type FillSelectGapsResult } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/FillSelectGapsResult';
import { fillSelectGapsInOneDimensionalBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/fillSelectGapsInOneDimensionalBarChartData';
import { fillSelectGapsInTwoDimensionalBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/fillSelectGapsInTwoDimensionalBarChartData';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { isDefined } from 'twenty-shared/utils';

type FillSelectGapsParams = {
  data: GroupByRawResult[];
  selectOptions: FieldMetadataItemOption[] | null | undefined;
  aggregateKeys: string[];
  hasSecondDimension?: boolean;
};

export const fillSelectGapsInBarChartData = ({
  data,
  selectOptions,
  aggregateKeys,
  hasSecondDimension = false,
}: FillSelectGapsParams): FillSelectGapsResult => {
  if (!isDefined(selectOptions) || selectOptions.length === 0) {
    return { data };
  }

  if (data.length === 0) {
    return { data };
  }

  return hasSecondDimension
    ? fillSelectGapsInTwoDimensionalBarChartData({
        data,
        selectOptions,
        aggregateKeys,
      })
    : fillSelectGapsInOneDimensionalBarChartData({
        data,
        selectOptions,
        aggregateKeys,
      });
};
