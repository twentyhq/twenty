import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowBackUp } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { EmailLoader } from '@/activities/emails/components/EmailLoader';
import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getEmailDraftPrefillFromMessage } from '@/activities/emails/utils/getEmailDraftPrefillFromMessage';
import { useInboxItemPlanContext } from '@/inbox/hooks/useInboxItemPlanContext';
import { EMAIL_TOOL_CALL_INPUT_SCHEMA } from '@/inbox/tool-call-renderers/email/constants/EmailToolCallInputSchema';
import { SEND_EMAIL_TOOL_NAME } from '@/inbox/tool-call-renderers/email/constants/SendEmailToolName';
import { useInboxEmailReplyDefaults } from '@/inbox/tool-call-renderers/email/hooks/useInboxEmailReplyDefaults';
import { buildEmailToolCallInput } from '@/inbox/tool-call-renderers/email/utils/buildEmailToolCallInput';
import { EmailThreadIntermediaryMessages } from '@/page-layout/widgets/email-thread/components/EmailThreadIntermediaryMessages';

const StyledSummary = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.5;
  margin: 0;
`;

const StyledThread = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledReplyBar = styled.button`
  align-items: center;
  all: unset;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    color: ${themeCssVariables.font.color.secondary};
  }
`;

type InboxItemThreadContextProps = {
  messageThreadId: string;
};

// An item about a thread is read in that thread. Replying adds a send_email
// call to the plan, proposed like an agent's would be; from there the featured
// slot draws the composer and the footer sends, so a reply typed by hand keeps
// the same audit row and permissions as any other step.
export const InboxItemThreadContext = ({
  messageThreadId,
}: InboxItemThreadContextProps) => {
  const { t } = useLingui();
  const { inboxItem, isDone, isBusy, featuredToolCall, createToolCall } =
    useInboxItemPlanContext();
  const { thread, messages, fetchMoreMessages, threadLoading } =
    useEmailThread(messageThreadId);
  const replyDefaults = useInboxEmailReplyDefaults({
    messageThreadId,
    queueId: inboxItem.queueId,
  });

  const canReply = !isDone && !isDefined(featuredToolCall);

  const addReply = (prefill?: EmailThreadMessageWithSender) => {
    if (!canReply || isBusy) {
      return;
    }

    const draft = isDefined(prefill)
      ? getEmailDraftPrefillFromMessage(prefill)
      : null;
    const to = draft?.to ?? replyDefaults.to ?? '';

    void createToolCall({
      toolName: SEND_EMAIL_TOOL_NAME,
      label: isNonEmptyString(to) ? t`Reply to ${to}` : t`Reply`,
      icon: 'IconMail',
      inputSchema: EMAIL_TOOL_CALL_INPUT_SCHEMA,
      proposedInput: buildEmailToolCallInput({
        to,
        cc: draft?.cc ?? '',
        bcc: draft?.bcc ?? '',
        subject: draft?.subject ?? replyDefaults.subject ?? '',
        body: draft?.body ?? '',
        connectedAccountId: replyDefaults.connectedAccountId,
        inReplyTo: replyDefaults.inReplyTo,
      }),
    });
  };

  const messagesCount = messages.length;
  const is5OrMoreMessages = messagesCount >= 5;
  const firstMessages = messages.slice(
    0,
    is5OrMoreMessages ? 2 : messagesCount - 1,
  );
  const intermediaryMessages = is5OrMoreMessages
    ? messages.slice(2, messagesCount - 1)
    : [];
  const lastMessage = messages[messagesCount - 1];

  const isThreadReady =
    !threadLoading && isDefined(thread) && isDefined(lastMessage);

  return (
    <>
      {isNonEmptyString(inboxItem.summary) && (
        <StyledSummary>{inboxItem.summary}</StyledSummary>
      )}
      <StyledThread>
        {!isThreadReady ? (
          <EmailLoader loadingText={t`Loading thread`} />
        ) : (
          <>
            {firstMessages.map((message) => (
              <EmailThreadMessage
                key={message.id}
                message={message}
                onDraftClick={addReply}
              />
            ))}
            <EmailThreadIntermediaryMessages
              messages={intermediaryMessages}
              onDraftClick={addReply}
            />
            <EmailThreadMessage
              key={lastMessage.id}
              message={lastMessage}
              isExpanded
              hideBottomBorder={!canReply}
              onDraftClick={addReply}
            />
            <CustomResolverFetchMoreLoader
              loading={threadLoading}
              onLastRowVisible={fetchMoreMessages}
            />
          </>
        )}
        {canReply && (
          <StyledReplyBar
            type="button"
            disabled={isBusy}
            onClick={() => addReply()}
          >
            <IconArrowBackUp size={16} />
            {t`Reply...`}
          </StyledReplyBar>
        )}
      </StyledThread>
    </>
  );
};
