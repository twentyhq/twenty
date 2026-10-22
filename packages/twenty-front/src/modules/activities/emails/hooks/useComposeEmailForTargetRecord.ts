import { useResolveDefaultEmailRecipient } from '@/activities/emails/hooks/useResolveDefaultEmailRecipient';
import { useResolveNewEmailSender } from '@/activities/emails/hooks/useResolveNewEmailSender';
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
  const { resolveNewEmailSender, loading: senderLoading } =
    useResolveNewEmailSender();

  const { defaultTo, loading: recipientLoading } =
    useResolveDefaultEmailRecipient({
      objectNameSingular: targetRecord.targetObjectNameSingular,
      recordId: targetRecord.id,
    });

  const openComposer = () => {
    const sender = resolveNewEmailSender();

    if (!isDefined(sender)) {
      navigateSettings(SettingsPath.NewAccount);

      return;
    }

    openComposeEmailInSidePanel({
      connectedAccountId: sender.connectedAccountId,
      initialFromHandle: sender.fromHandle,
      defaultTo,
      contextRecord: {
        objectNameSingular: targetRecord.targetObjectNameSingular,
        recordId: targetRecord.id,
      },
    });
  };

  return {
    openComposer,
    loading: senderLoading || recipientLoading,
  };
};
