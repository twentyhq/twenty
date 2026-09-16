import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { type ReactNode, useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { IconArrowBackUp, IconSend } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { EmailLoader } from '@/activities/emails/components/EmailLoader';
import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getEmailDraftPrefillFromMessage } from '@/activities/emails/utils/getEmailDraftPrefillFromMessage';
import { getReplyDefaultsFromMessages } from '@/activities/emails/utils/getReplyDefaultsFromMessages';
import { InboxPlanToolCallRow } from '@/inbox/components/InboxPlanToolCallRow';
import { InboxToolCallFailureNotice } from '@/inbox/components/InboxToolCallFailureNotice';
import {
  InboxEmailComposer,
  type InboxEmailComposerHandle,
} from '@/inbox/tool-call-renderers/email/components/InboxEmailComposer';
import { SEND_EMAIL_TOOL_NAME } from '@/inbox/tool-call-renderers/email/constants/SendEmailToolName';
import { useInboxReplyAccount } from '@/inbox/tool-call-renderers/email/hooks/useInboxReplyAccount';
import {
  getEmailComposerPrefillFromToolCall,
  type InboxEmailComposerPrefill,
} from '@/inbox/tool-call-renderers/email/utils/getEmailComposerPrefillFromToolCall';
import { isEmailToolName } from '@/inbox/tool-call-renderers/email/utils/isEmailToolName';
import { getInboxToolCallRenderer } from '@/inbox/tool-call-renderers/utils/getInboxToolCallRenderer';
import { EmailThreadIntermediaryMessages } from '@/page-layout/widgets/email-thread/components/EmailThreadIntermediaryMessages';
import {
  type InboxItem,
  type InboxItemToolCall,
  InboxItemScope,
  InboxItemToolCallStatus,
} from '~/generated/graphql';

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

const StyledFailure = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[2]};
`;

const StyledSectionTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledToolCallRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledFooter = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledFooterNote = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledFooterEnd = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-left: auto;
`;

const EMPTY_PREFILL: InboxEmailComposerPrefill = {
  to: '',
  cc: '',
  bcc: '',
  subject: '',
  body: '',
};

type InboxItemThreadViewProps = {
  inboxItem: InboxItem;
  threadId: string;
  isBusy: boolean;
  // Dismiss and snooze, or the done-state controls: the same in every layout,
  // so the item view keeps them.
  footerControls: ReactNode;
  onSaveToolCallInput: (
    toolCallId: string,
    editedInput: Record<string, unknown>,
  ) => Promise<void>;
  onToggleToolCallRejected: (
    toolCallId: string,
    isRejected: boolean,
  ) => Promise<void>;
  onRunToolCall: (toolCallId: string) => Promise<void>;
  onRunAll: () => Promise<void>;
  onCreateAndRunToolCall: (draft: {
    toolName: string;
    label: string;
    icon: string;
    proposedInput: Record<string, unknown>;
  }) => Promise<void>;
};

// An item about a thread is read in that thread: the conversation is the
// context and the reply is the work, so both take the body of the pane. The
// composer edits a tool call and the send runs it, which is what keeps this
// one surface with the audit row and the permissions of every other plan.
export const InboxItemThreadView = ({
  inboxItem,
  threadId,
  isBusy,
  footerControls,
  onSaveToolCallInput,
  onToggleToolCallRejected,
  onRunToolCall,
  onRunAll,
  onCreateAndRunToolCall,
}: InboxItemThreadViewProps) => {
  const { t } = useLingui();
  const [composerHandle, setComposerHandle] =
    useState<InboxEmailComposerHandle | null>(null);

  const {
    thread,
    messages,
    fetchMoreMessages,
    threadLoading,
    lastMessageChannelId,
  } = useEmailThread(threadId);
  const { replyAccount } = useInboxReplyAccount({
    queueId: inboxItem.queueId,
    receivingMessageChannelId: lastMessageChannelId,
  });

  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [draftFromMessage, setDraftFromMessage] =
    useState<InboxEmailComposerPrefill | null>(null);
  const [hasPickedSender, setHasPickedSender] = useState(false);
  const [expandedToolCallIds, setExpandedToolCallIds] = useState<string[]>([]);

  const isDone = inboxItem.scope === InboxItemScope.DONE;

  // The first email call still open is what the composer edits: proposed, or
  // failed and waiting to be fixed and sent again. Anything else in the plan
  // is listed beneath it.
  const emailToolCall = inboxItem.toolCalls.find(
    (toolCall) =>
      isEmailToolName(toolCall.toolName) &&
      (toolCall.status === InboxItemToolCallStatus.PROPOSED ||
        toolCall.status === InboxItemToolCallStatus.FAILED),
  );
  const isRetry = emailToolCall?.status === InboxItemToolCallStatus.FAILED;
  const proposalPrefill = isDefined(emailToolCall)
    ? getEmailComposerPrefillFromToolCall(emailToolCall)
    : null;
  const otherToolCalls = inboxItem.toolCalls.filter(
    (toolCall) => toolCall.id !== emailToolCall?.id,
  );
  const otherPendingCount = otherToolCalls.filter(
    (toolCall) => toolCall.status === InboxItemToolCallStatus.PROPOSED,
  ).length;

  const threadReplyDefaults = getReplyDefaultsFromMessages({
    messages,
    connectedAccountHandle: replyAccount?.connectedAccountHandle,
  });
  const replyDefaults = {
    to: threadReplyDefaults?.to ?? '',
    subject: threadReplyDefaults?.subject ?? '',
    inReplyTo: threadReplyDefaults?.inReplyTo,
    connectedAccountId: replyAccount?.connectedAccountId,
  };

  // Without a sender nothing can go out, but the composer still shows: the
  // person can pick one under From, and an empty pane would explain nothing.
  const hasSender =
    hasPickedSender ||
    isDefined(replyAccount) ||
    isNonEmptyString(proposalPrefill?.connectedAccountId);

  const isComposerOpen = !isDone && (isDefined(emailToolCall) || isReplyOpen);
  const canSend = !isBusy && hasSender;
  // A retry runs its own row only: the plan run leaves failed rows alone.
  const canRunRest = otherPendingCount > 0 && !isRetry;

  const sendLabel = isRetry
    ? t`Try again`
    : isDefined(emailToolCall)
      ? (getInboxToolCallRenderer(emailToolCall.toolName)?.runLabel() ??
        t`Send`)
      : t`Send`;

  const handleDraftClick = (message: EmailThreadMessageWithSender) => {
    if (isDefined(emailToolCall)) {
      return;
    }

    const draft = getEmailDraftPrefillFromMessage(message);

    setDraftFromMessage({
      to: draft.to,
      cc: draft.cc ?? '',
      bcc: draft.bcc ?? '',
      subject: draft.subject,
      body: draft.body,
    });
    setIsReplyOpen(true);
  };

  const sendProposal = async (alsoRunRest: boolean) => {
    if (!isDefined(emailToolCall)) {
      return;
    }

    await composerHandle?.flushSave();

    if (alsoRunRest) {
      await onRunAll();
    } else {
      await onRunToolCall(emailToolCall.id);
    }
  };

  // No proposal to run, so the reply becomes a call first. The person is its
  // author, and the row records that the same way it would an agent's.
  const sendAdHoc = async () => {
    if (!isDefined(composerHandle)) {
      return;
    }

    const proposedInput = composerHandle.getInput();
    const recipients = proposedInput.recipients;
    const to =
      isPlainObject(recipients) && isString(recipients.to) ? recipients.to : '';

    await onCreateAndRunToolCall({
      toolName: SEND_EMAIL_TOOL_NAME,
      label: isNonEmptyString(to) ? t`Reply to ${to}` : t`Reply`,
      icon: 'IconMail',
      proposedInput,
    });
  };

  const toggleToolCall = (toolCallId: string) =>
    setExpandedToolCallIds((current) =>
      current.includes(toolCallId)
        ? current.filter((id) => id !== toolCallId)
        : [...current, toolCallId],
    );

  const renderToolCallRow = (toolCall: InboxItemToolCall) => (
    <InboxPlanToolCallRow
      key={toolCall.id}
      toolCall={toolCall}
      source={inboxItem.context.source ?? undefined}
      isExpanded={expandedToolCallIds.includes(toolCall.id)}
      onToggleExpanded={() => toggleToolCall(toolCall.id)}
      onSave={(editedInput) => onSaveToolCallInput(toolCall.id, editedInput)}
      onToggleRejected={(isRejected) =>
        onToggleToolCallRejected(toolCall.id, isRejected)
      }
    />
  );

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
      <StyledThread>
        {!isThreadReady ? (
          <EmailLoader loadingText={t`Loading thread`} />
        ) : (
          <>
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
              hideBottomBorder={!isComposerOpen}
              onDraftClick={handleDraftClick}
            />
            <CustomResolverFetchMoreLoader
              loading={threadLoading}
              onLastRowVisible={fetchMoreMessages}
            />
          </>
        )}
        {isComposerOpen && (
          <>
            {isRetry && isDefined(emailToolCall) && (
              <StyledFailure>
                <InboxToolCallFailureNotice error={emailToolCall.error} />
              </StyledFailure>
            )}
            <InboxEmailComposer
              // Remounted per call and per state so the draft is the row shown.
              key={
                isDefined(emailToolCall)
                  ? `${emailToolCall.id}-${emailToolCall.status}`
                  : 'reply'
              }
              prefill={proposalPrefill ?? draftFromMessage ?? EMPTY_PREFILL}
              replyDefaults={replyDefaults}
              contextRecord={{
                recordId: threadId,
                objectNameSingular: CoreObjectNameSingular.MessageThread,
              }}
              onSave={
                isDefined(emailToolCall)
                  ? (editedInput) =>
                      onSaveToolCallInput(emailToolCall.id, editedInput)
                  : undefined
              }
              onSenderChange={setHasPickedSender}
              ref={setComposerHandle}
            />
          </>
        )}
        {!isComposerOpen && !isDone && (
          <StyledReplyBar type="button" onClick={() => setIsReplyOpen(true)}>
            <IconArrowBackUp size={16} />
            {t`Reply...`}
          </StyledReplyBar>
        )}
      </StyledThread>

      {otherToolCalls.length > 0 && (
        <>
          <StyledSectionTitle>{t`Also in this plan`}</StyledSectionTitle>
          <StyledToolCallRows>
            {otherToolCalls.map(renderToolCallRow)}
          </StyledToolCallRows>
        </>
      )}

      <StyledFooter>
        {isComposerOpen && !hasSender && (
          <StyledFooterNote>{t`Pick a From address to send`}</StyledFooterNote>
        )}
        <StyledFooterEnd>
          {footerControls}
          {isComposerOpen && isDefined(emailToolCall) && (
            <>
              {canRunRest && (
                <Button
                  size="small"
                  variant="secondary"
                  disabled={!canSend}
                  title={sendLabel}
                  onClick={() => void sendProposal(false)}
                />
              )}
              <Button
                Icon={IconSend}
                accent="blue"
                size="small"
                variant="primary"
                disabled={!canSend}
                title={
                  canRunRest
                    ? t`${sendLabel} and do ${otherPendingCount} more`
                    : sendLabel
                }
                onClick={() => void sendProposal(canRunRest)}
              />
            </>
          )}
          {isComposerOpen && !isDefined(emailToolCall) && (
            <Button
              Icon={IconSend}
              accent="blue"
              size="small"
              variant="primary"
              disabled={!canSend}
              title={t`Send`}
              onClick={() => void sendAdHoc()}
            />
          )}
        </StyledFooterEnd>
      </StyledFooter>
    </>
  );
};
