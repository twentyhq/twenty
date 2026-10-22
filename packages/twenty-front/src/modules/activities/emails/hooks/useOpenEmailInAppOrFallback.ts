import { useResolveNewEmailSender } from '@/activities/emails/hooks/useResolveNewEmailSender';
import { useOpenComposeEmailInSidePanel } from '@/side-panel/hooks/useOpenComposeEmailInSidePanel';
import { isDefined } from 'twenty-shared/utils';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

export const useOpenEmailInAppOrFallback = () => {
  const { resolveNewEmailSender } = useResolveNewEmailSender();
  const { openComposeEmailInSidePanel } = useOpenComposeEmailInSidePanel();

  const openEmail = (email: string) => {
    const sender = resolveNewEmailSender();

    if (isDefined(sender)) {
      openComposeEmailInSidePanel({
        connectedAccountId: sender.connectedAccountId,
        initialFromHandle: sender.fromHandle,
        defaultTo: email,
      });

      return;
    }

    openUrlInNewTab(`mailto:${email}`);
  };

  return { openEmail };
};
