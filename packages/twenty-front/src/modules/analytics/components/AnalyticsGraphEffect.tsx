import { useGraphData } from '@/analytics/hooks/useGraphData';
import { analyticsGraphDataComponentState } from '@/analytics/states/analyticsGraphDataComponentState';
import { AnalyticsComponentProps as AnalyticsGraphEffectProps } from '@/analytics/types/AnalyticsComponentProps';
import { computeAnalyticsGraphDataFunction } from '@/analytics/utils/computeAnalyticsGraphDataFunction';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useState } from 'react';

export const AnalyticsGraphEffect = ({
  recordId,
  endpointName,
}: AnalyticsGraphEffectProps) => {
  const setAnalyticsGraphData = useSetRecoilComponentStateV2(
    analyticsGraphDataComponentState,
  );

  const transformDataFunction = computeAnalyticsGraphDataFunction(endpointName);
  const [isLoaded, setIsLoaded] = useState(false);

  const { fetchGraphData } = useGraphData({
    recordId,
    endpointName,
  });

  if (!isLoaded) {
    fetchGraphData('7D').then((graphInput) => {
      setAnalyticsGraphData(transformDataFunction(graphInput));
    });
    setIsLoaded(true);
  }

  return <></>;
};
