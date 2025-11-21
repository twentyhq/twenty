import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type ComputedDatum, type DatumId } from '@nivo/pie';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UsePieChartHandlersProps = {
  data: PieChartDataItem[];
  onSliceClick?: (datum: PieChartDataItem) => void;
};

export const usePieChartHandlers = ({
  data,
  onSliceClick,
}: UsePieChartHandlersProps) => {
  const [hoveredSliceId, setHoveredSliceId] = useState<DatumId | null>(null);

  const handleSliceClick = (
    datum: ComputedDatum<{ id: string; value: number; label?: string }>,
  ) => {
    const clickedItem = data.find((d) => d.id === datum.id);
    if (isDefined(clickedItem)) {
      if (isDefined(onSliceClick)) {
        onSliceClick(clickedItem);
      } else if (isDefined(clickedItem.to)) {
        window.location.href = clickedItem.to;
      }
    }
  };

  const hasClickableItems =
    isDefined(onSliceClick) || data.some((item) => isDefined(item.to));

  return {
    hoveredSliceId,
    setHoveredSliceId,
    handleSliceClick,
    hasClickableItems,
  };
};
