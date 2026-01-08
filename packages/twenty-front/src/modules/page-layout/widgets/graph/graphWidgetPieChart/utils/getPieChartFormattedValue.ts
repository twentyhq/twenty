import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { type ComputedDatum } from '@nivo/pie';
import { isDefined } from 'twenty-shared/utils';

import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type PieChartEnrichedData } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartEnrichedData';

type GetPieChartFormattedValueParams = {
  datum: ComputedDatum<PieChartDataItem>;
  enrichedData: PieChartEnrichedData[];
  formatOptions: GraphValueFormatOptions;
  displayType?: string;
};

export const getPieChartFormattedValue = ({
  datum,
  enrichedData,
  formatOptions,
  displayType,
}: GetPieChartFormattedValueParams): string | null => {
  const item = enrichedData.find(
    (enrichedDataItem) => enrichedDataItem.id === datum.id,
  );
  if (!isDefined(item)) return null;

  return displayType === 'percentage'
    ? formatGraphValue(item.percentage / 100, formatOptions)
    : `${formatGraphValue(item.value, formatOptions)} (${item.percentage.toFixed(1)}%)`;
};
