import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useRef, useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowBackUp, IconSend } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { EmailLoader } from '@/activities/emails/components/EmailLoader';
import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { useReplyContext } from '@/activities/emails/hooks/useReplyContext';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getEmailDraftPrefillFromMessage } from '@/activities/emails/utils/getEmailDraftPrefillFromMessage';
import { InboxPlanToolCallRow } from '@/inbox/components/InboxPlanToolCallRow';
import {
  InboxEmailComposer,
  type InboxEmailComposerHandle,
} from '@/inbox/tool-call-renderers/email/components/InboxEmailComposer';
import { EMAIL_TOOL_CALL_INPUT_SCHEMA } from '@/inbox/tool-call-renderers/email/constants/EmailToolCallInputSchema';
import {
  isEmailToolName,
  SEND_EMAIL_TOOL_NAME,
} from '@/inbox/tool-call-renderers/email/constants/EmailToolCallNames';
import {
  getEmailComposerPrefillFromToolCall,
  type InboxEmailComposerPrefill,
} from '@/inbox/tool-call-renderers/email/utils/getEmailComposerPrefillFromToolCall';
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

const StyledFooterEnd = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-left: auto;
`;

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
  const composerHandleRef = useRef<InboxEmailComposerHandle | null>(null);

  const { thread, messages, fetchMoreMessages, threadLoading } =
    useEmailThread(threadId);
  const replyContext = useReplyContext(threadId);

  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [draftFromMessage, setDraftFromMessage] =
    useState<InboxEmailComposerPrefill | null>(null);
  const [expandedToolCallIds, setExpandedToolCallIds] = useState<string[]>([]);

  const isDone = inboxItem.scope === InboxItemScope.DONE;

  // The first email call still proposed is what the composer edits; anything
  // else in the plan is listed beneath it.
  const emailToolCall = inboxItem.toolCalls.find(
    (toolCall) =>
      isEmailToolName(toolCall.toolName) &&
      toolCall.status === InboxItemToolCallStatus.PROPOSED,
  );
  const otherToolCalls = inboxItem.toolCalls.filter(
    (toolCall) => toolCall.id !== emailToolCall?.id,
  );
  const otherPendingCount = otherToolCalls.filter(
    (toolCall) => toolCall.status === InboxItemToolCallStatus.PROPOSED,
  ).length;

  const replyDefaults =
    isDefined(replyContext) && !replyContext.loading
      ? {
          to: replyContext.to,
          subject: replyContext.subject,
          connectedAccountId: replyContext.connectedAccountId,
          inReplyTo: replyContext.inReplyTo,
        }
      : undefined;

  const isComposerOpen =
    !isDone && (isDefined(emailToolCall) || isReplyOpen);

  const sendLabel = isDefined(emailToolCall)
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

    await composerHandleRef.current?.flushSave();

    if (alsoRunRest) {
      await onRunAll();
    } else {
      await onRunToolCall(emailToolCall.id);
    }
  };

  // No proposal to run, so the reply becomes a call first. The person is its
  // author, and the row records that the same way it would an agent's.
  const sendAdHoc = async () => {
    const handle = composerHandleRef.current;

    if (!isDefined(handle)) {
      return;
    }

    await onCreateAndRunToolCall({
      toolName: SEND_EMAIL_TOOL_NAME,
      label: t`Reply`,
      icon: 'IconMail',
      proposedInput: handle.getInput(),
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
        {isComposerOpen && isDefined(replyDefaults) && (
          <InboxEmailComposer
            // Remounted per call and per state so the draft is the row shown.
            key={
              isDefined(emailToolCall)
                ? `${emailToolCall.id}-${emailToolCall.status}`
                : 'reply'
            }
            prefill={
              isDefined(emailToolCall)
                ? getEmailComposerPrefillFromToolCall(emailToolCall)
                : (draftFromMessage ?? {
                    to: '',
                    cc: '',
                    bcc: '',
                    subject: '',
                    body: '',
                  })
            }
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
            onHandleChange={(handle) => {
              composerHandleRef.current = handle;
            }}
          />
        )}
        {!isComposerOpen && !isDone && isDefined(replyDefaults) && (
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
        <StyledFooterEnd>
          {footerControls}
          {isComposerOpen && isDefined(emailToolCall) && (
            <>
              {otherPendingCount > 0 && (
                <Button
                  size="small"
                  variant="secondary"
                  disabled={isBusy}
                  title={sendLabel}
                  onClick={() => void sendProposal(false)}
                />
              )}
              <Button
                Icon={IconSend}
                accent="blue"
                size="small"
                variant="primary"
                disabled={isBusy}
                title={
                  otherPendingCount > 0
                    ? t`${sendLabel} and do ${otherPendingCount} more`
                    : sendLabel
                }
                onClick={() => void sendProposal(otherPendingCount > 0)}
              />
            </>
          )}
          {isComposerOpen && !isDefined(emailToolCall) && (
            <Button
              Icon={IconSend}
              accent="blue"
              size="small"
              variant="primary"
              disabled={isBusy}
              title={t`Send`}
              onClick={() => void sendAdHoc()}
            />
          )}
        </StyledFooterEnd>
      </StyledFooter>
    </>
  );
};
