import { useGraphData } from '@/settings/developers/webhook/hooks/useGraphData';
import { webhookGraphDataState } from '@/settings/developers/webhook/states/webhookGraphDataState';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

type SettingsDevelopersWebhookUsageGraphEffectProps = {
  webhookId: string;
};

export const SettingsDevelopersWebhookUsageGraphEffect = ({
  webhookId,
}: SettingsDevelopersWebhookUsageGraphEffectProps) => {
  const setWebhookGraphData = useSetRecoilState(webhookGraphDataState);

  const { fetchGraphData } = useGraphData(webhookId);

  useEffect(() => {
    fetchGraphData('7D').then((graphInput) => {
      setWebhookGraphData(graphInput);
    });
  }, [fetchGraphData, setWebhookGraphData, webhookId]);

  return <></>;
};
