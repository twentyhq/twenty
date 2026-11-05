import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';
import { computeSyncStatus } from '@/settings/accounts/utils/computeSyncStatus';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconChevronRight } from 'twenty-ui/icon';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type GettingStartedConnectedAccountSettingsButtonProps = {
  account: Pick<
    ConnectedAccount,
    'id' | 'handle' | 'messageChannels' | 'calendarChannels'
  >;
};

export const GettingStartedConnectedAccountSettingsButton = ({
  account,
}: GettingStartedConnectedAccountSettingsButtonProps) => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const isPendingConfiguration =
    computeSyncStatus(
      account.messageChannels[0],
      account.calendarChannels[0],
    ) === SyncStatus.PENDING_CONFIGURATION;

  return (
    <LightIconButton
      emphasis="subtle"
      aria-label={t`Open ${account.handle} settings`}
      onClick={() =>
        navigateSettings(
          isPendingConfiguration
            ? SettingsPath.AccountsConfiguration
            : SettingsPath.AccountDetail,
          { connectedAccountId: account.id },
        )
      }
    >
      <IconChevronRight />
    </LightIconButton>
  );
};
