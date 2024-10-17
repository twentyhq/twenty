import { NivoLineInput } from '@/settings/developers/webhook/components/SettingsDevelopersWebhookUsageGraph';
import { WEBHOOK_GRAPH_API_OPTIONS_MAP } from '@/settings/developers/webhook/constants/WebhookGraphApiOptionsMap';

type fetchGraphDataOrThrowProps = {
  webhookId: string;
  windowLength: '7D' | '1D' | '12H' | '4H';
};

export const fetchGraphDataOrThrow = async ({
  webhookId,
  windowLength,
}: fetchGraphDataOrThrowProps) => {
  const queryString = new URLSearchParams({
    ...WEBHOOK_GRAPH_API_OPTIONS_MAP[windowLength],
    webhookIdRequest: webhookId,
  }).toString();
  const token = 'REPLACE_ME';
  const response = await fetch(
    `https://api.eu-central-1.aws.tinybird.co/v0/pipes/getWebhooksAnalyticsV2.json?${queryString}`,
    {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    },
  );
  const result = await response.json();

  if (!response.ok) {
    throw new Error('Something went wrong while fetching webhook usage');
  }
  // Next steps: separate the map logic to a different component (response.data, {id:str, color:str}[])=>NivoLineInput[]

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
          id: 'Failed',
          color: 'red', // need to refacto this
        },
        {
          x: dataRow.start_interval,
          y: dataRow.success_count,
          id: 'Succeeded',
          color: 'blue',
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
        const existingGroupIndex = acc.findIndex((group) => group.id === id);
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
  return graphInput;
};
