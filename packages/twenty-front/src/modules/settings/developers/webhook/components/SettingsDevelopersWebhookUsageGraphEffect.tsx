import { NivoLineInput } from '@/settings/developers/webhook/components/SettingsDevelopersWebhookUsageGraph';
import { webhookGraphDataState } from '@/settings/developers/webhook/states/webhookGraphDataState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
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
    const fetchData = async () => {
      try {
        const queryString = new URLSearchParams({
          webhookIdRequest: webhookId,
        }).toString();
        const token = 'REPLACE_ME';
        const response = await fetch(
          `https://api.eu-central-1.aws.tinybird.co/v0/pipes/getWebhooksAnalytics.json?${queryString}`,
          {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          },
        );
        const result = await response.json();

        if (!response.ok) {
          enqueueSnackBar('Something went wrong while fetching webhook usage', {
            variant: SnackBarVariant.Error,
          });
          return;
        }

        const graphInput = result.data
          .flatMap(
            (dataRow: {
              start_interval: string;
              failure_count: number;
              success_count: number;
            }) => [
              {
                x: dataRow.start_interval,
                y: dataRow.failure_count,
                id: 'failure_count',
                color: 'red',
              },
              {
                x: dataRow.start_interval,
                y: dataRow.success_count,
                id: 'success_count',
                color: 'green',
              },
            ],
          )
          .reduce(
            (
              acc: NivoLineInput[],
              {
                id,
                x,
                y,
                color,
              }: { id: string; x: string; y: number; color: string },
            ) => {
              const existingGroupIndex = acc.findIndex(
                (group) => group.id === id,
              );
              const isExistingGroup = existingGroupIndex !== -1;

              if (isExistingGroup) {
                return acc.map((group, index) =>
                  index === existingGroupIndex
                    ? { ...group, data: [...group.data, { x, y }] }
                    : group,
                );
              } else {
                return [...acc, { id, color, data: [{ x, y }] }];
              }
            },
            [],
          );
        setWebhookGraphData(graphInput);
      } catch (error) {
        enqueueSnackBar('Something went wrong while fetching webhook usage', {
          variant: SnackBarVariant.Error,
        });
      }
    };
    fetchData();
  }, [enqueueSnackBar, setWebhookGraphData, webhookId]);
  return <></>;
};
