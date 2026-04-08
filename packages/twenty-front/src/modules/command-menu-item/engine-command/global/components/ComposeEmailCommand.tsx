import { useFirstConnectedAccount } from '@/activities/emails/hooks/useFirstConnectedAccount';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useOpenComposeEmailInSidePanel } from '@/side-panel/hooks/useOpenComposeEmailInSidePanel';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const ComposeEmailCommand = () => {
  const { connectedAccountId, loading } = useFirstConnectedAccount();
  const { openComposeEmailInSidePanel } = useOpenComposeEmailInSidePanel();
  const navigateSettings = useNavigateSettings();

  const handleExecute = () => {
    if (!isDefined(connectedAccountId)) {
      navigateSettings(SettingsPath.NewAccount);

      return;
    }

    openComposeEmailInSidePanel({
      connectedAccountId,
    });
  };

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={handleExecute}
      ready={!loading}
    />
  );
};
