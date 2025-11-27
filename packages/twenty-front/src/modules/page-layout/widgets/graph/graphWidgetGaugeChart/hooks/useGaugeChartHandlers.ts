import { type GaugeChartData } from '@/page-layout/widgets/graph/graphWidgetGaugeChart/types/GaugeChartData';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseGaugeChartHandlersProps = {
  data: GaugeChartData;
  onGaugeClick?: (data: GaugeChartData) => void;
};

export const useGaugeChartHandlers = ({
  data,
  onGaugeClick,
}: UseGaugeChartHandlersProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onGaugeClick?.(data);
  };

  const hasClickableItems = isDefined(onGaugeClick);

  return {
    isHovered,
    setIsHovered,
    handleClick,
    hasClickableItems,
  };
};
