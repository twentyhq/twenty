import { BAR_CHART_DATE_GRANULARITIES_WITHOUT_GAP_FILLING } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartDateGranularitiesWithoutGapFilling.constant';
import { fillDateGapsInOneDimensionalBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/fillDateGapsInOneDimensionalBarChartData';
import { fillDateGapsInTwoDimensionalBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/fillDateGapsInTwoDimensionalBarChartData';
import { type SupportedDateGranularity } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getDateGroupsFromData';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { type GraphOrderBy } from '~/generated/graphql';

type FillDateGapsParams = {
  data: GroupByRawResult[];
  keys: string[];
  dateGranularity: ObjectRecordGroupByDateGranularity;
  hasSecondDimension?: boolean;
  orderBy?: GraphOrderBy | null;
};

export const fillDateGapsInBarChartData = ({
  data,
  keys,
  dateGranularity,
  hasSecondDimension = false,
  orderBy,
}: FillDateGapsParams): { data: GroupByRawResult[]; wasTruncated: boolean } => {
  if (data.length === 0) {
    return { data, wasTruncated: false };
  }

  if (BAR_CHART_DATE_GRANULARITIES_WITHOUT_GAP_FILLING.has(dateGranularity)) {
    return { data, wasTruncated: false };
  }

  if (hasSecondDimension) {
    return fillDateGapsInTwoDimensionalBarChartData({
      data,
      keys,
      dateGranularity: dateGranularity as SupportedDateGranularity,
      orderBy,
    });
  }

  return fillDateGapsInOneDimensionalBarChartData({
    data,
    keys,
    dateGranularity: dateGranularity as SupportedDateGranularity,
    orderBy,
  });
};
