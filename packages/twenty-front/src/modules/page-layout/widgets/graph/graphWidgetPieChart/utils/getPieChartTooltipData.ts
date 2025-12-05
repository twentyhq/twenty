import { type GraphWidgetTooltipItem } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type PieChartEnrichedData } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartEnrichedData';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { type ComputedDatum } from '@nivo/pie';
import { isDefined } from 'twenty-shared/utils';

import { getPieChartFormattedValue } from './getPieChartFormattedValue';

type GetPieChartTooltipDataParams = {
  datum: ComputedDatum<PieChartDataItem>;
  enrichedData: PieChartEnrichedData[];
  formatOptions: GraphValueFormatOptions;
  displayType?: string;
};

export const getPieChartTooltipData = ({
  datum,
  enrichedData,
  formatOptions,
  displayType,
}: GetPieChartTooltipDataParams): {
  tooltipItem: GraphWidgetTooltipItem;
} | null => {
  const item = enrichedData.find(
    (enrichedDataItem) => enrichedDataItem.id === datum.id,
  );
  if (!isDefined(item)) return null;

  const formattedValue = getPieChartFormattedValue({
    datum,
    enrichedData,
    formatOptions,
    displayType,
  });
  if (!isDefined(formattedValue)) return null;

  return {
    tooltipItem: {
      key: item.id,
      label: item.id,
      formattedValue,
      value: item.value,
      dotColor: item.colorScheme.solid,
    },
  };
};
