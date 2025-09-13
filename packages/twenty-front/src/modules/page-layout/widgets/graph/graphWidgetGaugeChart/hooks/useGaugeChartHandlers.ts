import { type GaugeChartData } from '@/page-layout/widgets/graph/graphWidgetGaugeChart/types/GaugeChartData';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseGaugeChartHandlersProps = {
  data: GaugeChartData;
};

export const useGaugeChartHandlers = ({ data }: UseGaugeChartHandlersProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (isDefined(data.to)) {
      window.location.href = data.to;
    }
  };

  const hasClickableItems = isDefined(data.to);

  return {
    isHovered,
    setIsHovered,
    handleClick,
    hasClickableItems,
  };
};
