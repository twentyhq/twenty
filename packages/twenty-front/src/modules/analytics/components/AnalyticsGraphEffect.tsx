import { useAnalyticsGraphDataState } from '@/analytics/hooks/useAnalyticsGraphDataState';
import { useGraphData } from '@/analytics/hooks/useGraphData';

import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';

type AnalyticsGraphEffectProps = {
  recordId: string;
  recordType: string;
  endpointName: string;
};

export const AnalyticsGraphEffect = ({
  recordId,
  recordType,
  endpointName,
}: AnalyticsGraphEffectProps) => {
  const { analyticsState, transformDataFunction } =
    useAnalyticsGraphDataState(endpointName);
  const setGraphData = useSetRecoilState(analyticsState);
  const [isLoaded, setIsLoaded] = useState(false);

  const { fetchGraphData } = useGraphData({
    recordId,
    recordType,
    endpointName,
  });

  useEffect(() => {
    if (!isLoaded) {
      fetchGraphData('7D').then((graphInput) => {
        setGraphData(transformDataFunction(graphInput));
      });
      setIsLoaded(true);
    }
  }, [
    fetchGraphData,
    isLoaded,
    setGraphData,
    recordId,
    recordType,
    endpointName,
    transformDataFunction,
  ]);

  return <></>;
};
