import { useMemo } from 'react';

import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const ALLOWED_REPLY_PROVIDERS = [
  ConnectedAccountProvider.GOOGLE,
  ConnectedAccountProvider.MICROSOFT,
  ConnectedAccountProvider.IMAP_SMTP_CALDAV,
];

export const ReplyToEmailThreadCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const threadId = selectedRecords[0]?.id ?? null;

  const {
    messageThreadExternalId,
    connectedAccountHandle,
    connectedAccountProvider,
    lastMessageExternalId,
    connectedAccountConnectionParameters,
    messageChannelLoading,
  } = useEmailThread(threadId);

  const canReply = useMemo(() => {
    return (
      isDefined(connectedAccountHandle) &&
      isDefined(connectedAccountProvider) &&
      ALLOWED_REPLY_PROVIDERS.includes(connectedAccountProvider) &&
      (connectedAccountProvider !== ConnectedAccountProvider.IMAP_SMTP_CALDAV ||
        isDefined(connectedAccountConnectionParameters?.SMTP)) &&
      isDefined(messageThreadExternalId)
    );
  }, [
    connectedAccountConnectionParameters,
    connectedAccountHandle,
    connectedAccountProvider,
    messageThreadExternalId,
  ]);

  const handleExecute = () => {
    if (!canReply) {
      return;
    }

    switch (connectedAccountProvider) {
      case ConnectedAccountProvider.MICROSOFT: {
        const url = `https://outlook.office.com/mail/deeplink?ItemID=${lastMessageExternalId}`;
        window.open(url, '_blank');
        break;
      }
      case ConnectedAccountProvider.GOOGLE: {
        const url = `https://mail.google.com/mail/?authuser=${connectedAccountHandle}#all/${messageThreadExternalId}`;
        window.open(url, '_blank');
        break;
      }
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
      case ConnectedAccountProvider.OIDC:
      case ConnectedAccountProvider.SAML:
      case null:
        return;
      default:
        return;
    }
  };

  const isReady = !messageChannelLoading && canReply;

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={handleExecute}
      ready={isReady}
    />
  );
};
