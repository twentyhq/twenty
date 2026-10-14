import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type ApplicationRegistrationAnalyticsVersion } from '~/generated-metadata/graphql';

const GRID_TEMPLATE_COLUMNS = '1fr 120px 120px 120px 140px';

type LogConsoleAppAnalyticsVersionTableProps = {
  versions: Pick<
    ApplicationRegistrationAnalyticsVersion,
    | 'version'
    | 'activeWorkspaces'
    | 'installSucceeded'
    | 'installFailed'
    | 'upgradeSucceeded'
    | 'upgradeFailed'
    | 'functionExecutions'
    | 'functionErrors'
  >[];
};

export const LogConsoleAppAnalyticsVersionTable = ({
  versions,
}: LogConsoleAppAnalyticsVersionTableProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();

  if (versions.length === 0) {
    return null;
  }

  const formatInstalls = ({
    installSucceeded,
    installFailed,
    upgradeSucceeded,
    upgradeFailed,
  }: {
    installSucceeded: number;
    installFailed: number;
    upgradeSucceeded: number;
    upgradeFailed: number;
  }) => {
    const installCount = formatNumber(installSucceeded + upgradeSucceeded);
    const failedCount = installFailed + upgradeFailed;

    if (failedCount === 0) {
      return installCount;
    }

    const formattedFailedCount = formatNumber(failedCount);

    return t`${installCount} (${formattedFailedCount} failed)`;
  };

  const formatErrors = ({
    functionErrors,
    functionExecutions,
  }: {
    functionErrors: number;
    functionExecutions: number;
  }) => {
    const errorCount = formatNumber(functionErrors);

    if (functionErrors === 0 || functionExecutions === 0) {
      return errorCount;
    }

    const errorRate = formatNumber(
      (functionErrors / functionExecutions) * 100,
      {
        decimals: 1,
      },
    );

    return t`${errorCount} (${errorRate}%)`;
  };

  return (
    <Section.Root>
      <Section.Header
        title={t`Versions`}
        description={t`Activity per version, newest first. Installs include upgrades to that version.`}
      />
      <Table>
        <TableRow gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
          <TableHeader>{t`Version`}</TableHeader>
          <TableHeader align="right">{t`Workspaces`}</TableHeader>
          <TableHeader align="right">{t`Installs`}</TableHeader>
          <TableHeader align="right">{t`Executions`}</TableHeader>
          <TableHeader align="right">{t`Errors`}</TableHeader>
        </TableRow>
        {versions.map((version) => (
          <TableRow
            key={version.version}
            gridTemplateColumns={GRID_TEMPLATE_COLUMNS}
          >
            <TableCell color={themeCssVariables.font.color.primary}>
              {version.version}
            </TableCell>
            <TableCell align="right">
              {formatNumber(version.activeWorkspaces)}
            </TableCell>
            <TableCell align="right">{formatInstalls(version)}</TableCell>
            <TableCell align="right">
              {formatNumber(version.functionExecutions)}
            </TableCell>
            <TableCell align="right">{formatErrors(version)}</TableCell>
          </TableRow>
        ))}
      </Table>
    </Section.Root>
  );
};
