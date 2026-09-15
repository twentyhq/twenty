import { useFirstConnectedAccount } from '@/activities/emails/hooks/useFirstConnectedAccount';
import { useResolveDefaultEmailRecipient } from '@/activities/emails/hooks/useResolveDefaultEmailRecipient';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useOpenComposeEmailInSidePanel } from '@/side-panel/hooks/useOpenComposeEmailInSidePanel';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useComposeEmailForTargetRecord = (
  targetRecord: ActivityTargetableObject,
) => {
  const { openComposeEmailInSidePanel } = useOpenComposeEmailInSidePanel();
  const navigateSettings = useNavigateSettings();
  const { connectedAccountId, loading: accountLoading } =
    useFirstConnectedAccount();

  const { defaultTo, loading: recipientLoading } =
    useResolveDefaultEmailRecipient({
      objectNameSingular: targetRecord.targetObjectNameSingular,
      recordId: targetRecord.id,
    });

  const openComposer = () => {
    if (!isDefined(connectedAccountId)) {
      navigateSettings(SettingsPath.NewAccount);

      return;
    }

    openComposeEmailInSidePanel({
      connectedAccountId,
      defaultTo,
      contextRecord: {
        objectNameSingular: targetRecord.targetObjectNameSingular,
        recordId: targetRecord.id,
      },
    });
  };

  return {
    openComposer,
    loading: accountLoading || recipientLoading,
  };
};
