import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsSyncFailedStatus } from '@/settings/applications/components/SettingsSyncFailedStatus';
import { connectionCheckFamilyState } from '@/settings/applications/states/connectionCheckFamilyState';
import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { ApplicationHealthStatus } from '~/generated-metadata/graphql';

type SettingsApplicationConnectionStatusProps = {
  connection: Partial<
    Pick<ConnectedAccount, 'id' | 'authFailedAt' | 'archivedAt'>
  >;
};

export const SettingsApplicationConnectionStatus = ({
  connection,
}: SettingsApplicationConnectionStatusProps) => {
  const { t } = useLingui();
  const { result: connectionCheckResult } = useAtomFamilyStateValue(
    connectionCheckFamilyState,
    connection.id ?? '',
  );

  if (isDefined(connection.archivedAt)) {
    return <Status color="gray" weight="medium">{t`Disconnected`}</Status>;
  }

  if (isApplicationConnectionReconnectNeeded(connection)) {
    return <SettingsSyncFailedStatus />;
  }

  if (
    connectionCheckResult?.status === ApplicationHealthStatus.WARNING ||
    connectionCheckResult?.status === ApplicationHealthStatus.ERROR
  ) {
    return (
      <Tooltip content={connectionCheckResult.title ?? undefined}>
        <Status
          color={
            connectionCheckResult.status === ApplicationHealthStatus.ERROR
              ? 'red'
              : 'orange'
          }
          weight="medium"
        >{t`Action needed`}</Status>
      </Tooltip>
    );
  }

  return <Status color="green" weight="medium">{t`Connected`}</Status>;
};
