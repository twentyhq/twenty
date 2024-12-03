import { NivoLineInput } from '@/analytics/types/NivoLineInput';

export const mapWebhookAnalyticsResultToNivoLineInput = (
  webhookAnalyticsResult: {
    start: string;
    failure_count: number;
    success_count: number;
  }[],
): NivoLineInput[] => {
  return webhookAnalyticsResult
    .flatMap((dataRow) => [
      {
        x: new Date(dataRow.start),
        y: dataRow.failure_count,
        id: 'Failed',
      },
      {
        x: new Date(dataRow.start),
        y: dataRow.success_count,
        id: 'Succeeded',
      },
    ])
    .reduce(
      (
        acc: NivoLineInput[],
        { id, x, y }: { id: string; x: Date; y: number },
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
          return [...acc, { id, data: [{ x, y }] }];
        }
      },
      [],
    );
};
