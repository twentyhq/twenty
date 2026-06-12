import { useReplyContext } from '@/activities/emails/hooks/useReplyContext';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenComposeEmailInSidePanel } from '@/side-panel/hooks/useOpenComposeEmailInSidePanel';
import { isDefined } from 'twenty-shared/utils';

export const ReplyToEmailThreadCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const threadId = selectedRecords[0]?.id ?? null;

  const replyContext = useReplyContext(threadId);
  const { openComposeEmailInSidePanel } = useOpenComposeEmailInSidePanel();

  const handleExecute = () => {
    if (!isDefined(replyContext) || replyContext.loading) {
      return;
    }

    openComposeEmailInSidePanel({
      threadId: threadId ?? undefined,
      connectedAccountId: replyContext.connectedAccountId,
      defaultTo: replyContext.to,
      defaultSubject: replyContext.subject,
      defaultInReplyTo: replyContext.inReplyTo,
    });
  };

  const isReady = isDefined(replyContext) && !replyContext.loading;

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={handleExecute}
      ready={isReady}
    />
  );
};
