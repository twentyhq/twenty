import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { fillDateGapsInOneDimensionalBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/fillDateGapsInOneDimensionalBarChartData';
import { fillDateGapsInTwoDimensionalBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/fillDateGapsInTwoDimensionalBarChartData';
import { type SupportedDateGranularity } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getDateGroupsFromData';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

type FillDateGapsParams = {
  data: GroupByRawResult[];
  keys: string[];
  dateGranularity: ObjectRecordGroupByDateGranularity;
  hasSecondDimension?: boolean;
};

export const fillDateGapsInBarChartData = ({
  data,
  keys,
  dateGranularity,
  hasSecondDimension = false,
}: FillDateGapsParams): { data: GroupByRawResult[]; wasTruncated: boolean } => {
  if (data.length === 0) {
    return { data, wasTruncated: false };
  }

  if (
    BAR_CHART_CONSTANTS.DATE_GRANULARITIES_WITHOUT_GAP_FILLING.has(
      dateGranularity,
    )
  ) {
    return { data, wasTruncated: false };
  }

  if (hasSecondDimension) {
    return fillDateGapsInTwoDimensionalBarChartData({
      data,
      keys,
      dateGranularity: dateGranularity as SupportedDateGranularity,
    });
  }

  return fillDateGapsInOneDimensionalBarChartData({
    data,
    keys,
    dateGranularity: dateGranularity as SupportedDateGranularity,
  });
};
