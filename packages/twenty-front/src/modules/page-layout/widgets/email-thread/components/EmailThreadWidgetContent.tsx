import { useCallback, useState } from 'react';

import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { useComposerDraft } from '@/activities/emails/hooks/useComposerDraft';
import { useReplyContext } from '@/activities/emails/hooks/useReplyContext';
import { type EmailDraftPrefill } from '@/activities/emails/types/EmailDraftPrefill';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { emailComposerDraftFamilyState } from '@/activities/emails/states/emailComposerDraftFamilyState';
import { getEmailDraftPrefillFromMessage } from '@/activities/emails/utils/getEmailDraftPrefillFromMessage';
import { WidgetRelationsHeader } from '@/page-layout/widgets/components/WidgetRelationsHeader';
import { EmailThreadComposer } from '@/page-layout/widgets/email-thread/components/EmailThreadComposer';
import { EmailThreadIntermediaryMessages } from '@/page-layout/widgets/email-thread/components/EmailThreadIntermediaryMessages';
import { getAppReplyTarget } from '@/activities/emails/utils/getAppReplyTarget';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import {
  StyledWidgetContentContainer,
  StyledWidgetScrollContainer,
} from '@/ui/layout/components/WidgetContentContainer';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

type EmailThreadWidgetContentProps = {
  messages: EmailThreadMessageWithSender[];
  lastMessage: EmailThreadMessageWithSender;
  loading: boolean;
  onFetchMoreMessages: () => void;
  messageChannelId: string | null;
};

export const EmailThreadWidgetContent = ({
  messages,
  lastMessage,
  loading,
  onFetchMoreMessages,
  messageChannelId,
}: EmailThreadWidgetContentProps) => {
  const targetRecord = useTargetRecord();
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';

  const replyContext = useReplyContext(targetRecord.id);

  const [composerIntent, setComposerIntent] = useState<
    'opened' | 'closed' | null
  >(null);
  const [clickedDraftPrefill, setClickedDraftPrefill] =
    useState<EmailDraftPrefill | null>(null);
  const [previousTargetRecordId, setPreviousTargetRecordId] = useState(
    targetRecord.id,
  );

  if (previousTargetRecordId !== targetRecord.id) {
    setPreviousTargetRecordId(targetRecord.id);
    setComposerIntent(null);
    setClickedDraftPrefill(null);
  }

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const emailComposerDraftKey = isDefined(currentWorkspaceMember)
    ? `${currentWorkspaceMember.id}:${targetRecord.id}`
    : undefined;

  const [emailComposerDraft] = useComposerDraft({
    draftFamilyState: emailComposerDraftFamilyState,
    draftKey: emailComposerDraftKey,
    defaultDraft: null,
  });

  const handleComposerOpenChange = useCallback((open: boolean) => {
    setComposerIntent(open ? 'opened' : 'closed');

    if (!open) {
      setClickedDraftPrefill(null);
    }
  }, []);

  const handleDraftClick = useCallback(
    (message: EmailThreadMessageWithSender) => {
      setClickedDraftPrefill(getEmailDraftPrefillFromMessage(message));
      setComposerIntent('opened');
    },
    [],
  );

  const canReply = isDefined(replyContext) && !replyContext.loading;

  const appReplyTarget = getAppReplyTarget({
    replyContext,
    messageChannelId,
    messageThreadId: targetRecord.id,
  });

  const messagesCount = messages.length;
  const is5OrMoreMessages = messagesCount >= 5;
  const firstMessages = messages.slice(
    0,
    is5OrMoreMessages ? 2 : messagesCount - 1,
  );
  const intermediaryMessages = is5OrMoreMessages
    ? messages.slice(2, messagesCount - 1)
    : [];

  const trailingDraft = lastMessage.isDraft ? lastMessage : undefined;
  const draftPrefill =
    clickedDraftPrefill ??
    (isDefined(trailingDraft)
      ? getEmailDraftPrefillFromMessage(trailingDraft)
      : null);
  const isComposerOpen =
    composerIntent === 'opened' ||
    (composerIntent === null &&
      (isDefined(trailingDraft) || isDefined(emailComposerDraft)));

  return (
    <StyledWidgetContentContainer>
      <WidgetRelationsHeader />
      <StyledWidgetScrollContainer>
        {firstMessages.map((message) => (
          <EmailThreadMessage
            key={message.id}
            message={message}
            onDraftClick={handleDraftClick}
          />
        ))}
        <EmailThreadIntermediaryMessages
          messages={intermediaryMessages}
          onDraftClick={handleDraftClick}
        />
        <EmailThreadMessage
          key={lastMessage.id}
          message={lastMessage}
          isExpanded
          hideBottomBorder
          onDraftClick={handleDraftClick}
        />
        <CustomResolverFetchMoreLoader
          loading={loading}
          onLastRowVisible={onFetchMoreMessages}
        />
      </StyledWidgetScrollContainer>
      {canReply && (
        <EmailThreadComposer
          key={draftPrefill?.messageId ?? targetRecord.id}
          replyContext={replyContext}
          isInSidePanel={isInSidePanel}
          isComposerOpen={isComposerOpen}
          setIsComposerOpen={handleComposerOpenChange}
          draftPrefill={draftPrefill}
          draftKey={isDefined(draftPrefill) ? undefined : emailComposerDraftKey}
          appReplyTarget={appReplyTarget}
        />
      )}
    </StyledWidgetContentContainer>
  );
};
