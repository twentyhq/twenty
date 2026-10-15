import { useLingui } from '@lingui/react/macro';
import {
  IconAlertTriangle,
  IconBrandDocker,
  IconBrandTypescript,
  IconBuildingSkyscraper,
  IconCoins,
  IconGauge,
  IconTrash,
  IconVersions,
} from 'twenty-ui/icon';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { useUsageValueFormatter } from '@/settings/usage/hooks/useUsageValueFormatter';
import { type ApplicationRegistrationAnalyticsTotals } from '~/generated-metadata/graphql';

type LogConsoleAppAnalyticsTotalsProps = {
  totals: Omit<ApplicationRegistrationAnalyticsTotals, '__typename'>;
  showActiveWorkspaces: boolean;
};

export const LogConsoleAppAnalyticsTotals = ({
  totals,
  showActiveWorkspaces,
}: LogConsoleAppAnalyticsTotalsProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();
  const { formatUsageValue } = useUsageValueFormatter();

  const formatWithFailures = ({
    succeeded,
    failed,
  }: {
    succeeded: number;
    failed: number;
  }) =>
    failed > 0
      ? t`${formatNumber(succeeded)} (${formatNumber(failed)} failed)`
      : formatNumber(succeeded);

  const items = [
    ...(showActiveWorkspaces
      ? [
          {
            Icon: IconBuildingSkyscraper,
            label: t`Active workspaces`,
            value: formatNumber(totals.activeWorkspaces),
          },
        ]
      : []),
    {
      Icon: IconBrandDocker,
      label: t`Installs`,
      value: formatWithFailures({
        succeeded: totals.installSucceeded,
        failed: totals.installFailed,
      }),
    },
    {
      Icon: IconVersions,
      label: t`Upgrades`,
      value: formatWithFailures({
        succeeded: totals.upgradeSucceeded,
        failed: totals.upgradeFailed,
      }),
    },
    {
      Icon: IconTrash,
      label: t`Uninstalls`,
      value: formatWithFailures({
        succeeded: totals.uninstallSucceeded,
        failed: totals.uninstallFailed,
      }),
    },
    {
      Icon: IconBrandTypescript,
      label: t`Function executions`,
      value: formatNumber(totals.functionExecutions),
    },
    {
      Icon: IconAlertTriangle,
      label: t`Function errors`,
      value: formatNumber(totals.functionErrors),
    },
    {
      Icon: IconGauge,
      label: t`Rate limit hits`,
      value: formatNumber(totals.apiRateLimited + totals.jobRateLimited),
    },
    {
      Icon: IconCoins,
      label: t`Credits charged`,
      value: formatUsageValue(totals.creditsCharged),
    },
  ];

  return (
    <SettingsTableCard rounded items={items} gridAutoColumns="200px 1fr" />
  );
};
