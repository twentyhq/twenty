import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarDatum, type ComputedDatum } from '@nivo/bar';
import { isDefined } from 'twenty-shared/utils';

type UseBarChartHandlersProps = {
  data: BarChartDataItem[];
  indexBy: string;
};

export const useBarChartHandlers = ({
  data,
  indexBy,
}: UseBarChartHandlersProps) => {
  const handleBarClick = (datum: ComputedDatum<BarDatum>) => {
    const dataItem = data.find(
      (dataRow) => dataRow[indexBy] === datum.indexValue,
    );
    if (isDefined(dataItem?.to)) {
      window.location.href = dataItem.to;
    }
  };

  const hasClickableItems = data.some((item) => isDefined(item.to));

  return {
    handleBarClick,
    hasClickableItems,
  };
};
