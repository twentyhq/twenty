import { webhookGraphDataState } from '@/settings/developers/webhook/states/webhookGraphDataState';
import { fetchGraphData } from '@/settings/developers/webhook/utils/fetchGraphData';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

type SettingsDevelopersWebhookUsageGraphEffectProps = {
  webhookId: string;
};

export const SettingsDevelopersWebhookUsageGraphEffect = ({
  webhookId,
}: SettingsDevelopersWebhookUsageGraphEffectProps) => {
  const setWebhookGraphData = useSetRecoilState(webhookGraphDataState);

  const { enqueueSnackBar } = useSnackBar();

  useEffect(() => {
    fetchGraphData({ webhookId, enqueueSnackBar }).then((graphInput) => {
      setWebhookGraphData(graphInput);
    });
  }, [enqueueSnackBar, setWebhookGraphData, webhookId]);

  return <></>;
};
