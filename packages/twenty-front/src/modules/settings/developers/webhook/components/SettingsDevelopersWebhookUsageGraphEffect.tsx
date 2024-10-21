import { useGraphData } from '@/settings/developers/webhook/hooks/useGraphData';
import { webhookGraphDataState } from '@/settings/developers/webhook/states/webhookGraphDataState';
import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';

type SettingsDevelopersWebhookUsageGraphEffectProps = {
  webhookId: string;
};

export const SettingsDevelopersWebhookUsageGraphEffect = ({
  webhookId,
}: SettingsDevelopersWebhookUsageGraphEffectProps) => {
  const setWebhookGraphData = useSetRecoilState(webhookGraphDataState);
  const [isLoaded, setIsLoaded] = useState(false);

  const { fetchGraphData } = useGraphData(webhookId);

  useEffect(() => {
    if (!isLoaded) {
      fetchGraphData('7D').then((graphInput) => {
        setWebhookGraphData(graphInput);
      });
      setIsLoaded(true);
    }
  }, [fetchGraphData, isLoaded, setWebhookGraphData, webhookId]);

  return <></>;
};
