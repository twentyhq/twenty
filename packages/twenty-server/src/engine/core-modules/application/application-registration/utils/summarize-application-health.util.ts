import { ApplicationHealthStatus } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const summarizeApplicationHealth = ({
  statuses,
  applications,
}: {
  statuses: (ApplicationHealthStatus | undefined)[];
  applications: { needsReconnection: boolean }[];
}) => ({
  checked: statuses.filter(isDefined).length,
  known: statuses.filter(
    (status) => isDefined(status) && status !== ApplicationHealthStatus.UNKNOWN,
  ).length,
  needingAttention: statuses.filter(
    (status, index) =>
      !applications[index].needsReconnection &&
      (status === ApplicationHealthStatus.WARNING ||
        status === ApplicationHealthStatus.ERROR),
  ).length,
});
