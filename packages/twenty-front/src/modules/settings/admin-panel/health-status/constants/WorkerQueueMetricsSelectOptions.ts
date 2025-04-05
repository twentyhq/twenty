import { QueueMetricsTimeRange } from '~/generated/graphql';

export const getWorkerQueueMetricsSelectOptions = (t: (key: TemplateStringsArray) => string) => [
    { value: QueueMetricsTimeRange.SevenDays, label: t`This week` },
    { value: QueueMetricsTimeRange.OneDay, label: t`Today` },
    {
    value: QueueMetricsTimeRange.TwelveHours,
    label: t`Last 12 hours`,
    },
    {
    value: QueueMetricsTimeRange.FourHours,
    label: t`Last 4 hours`,
    },
    { value: QueueMetricsTimeRange.OneHour, label: t`Last 1 hour` },
];
