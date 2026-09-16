import { styled } from '@linaria/react';
import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { EmailOperation } from 'twenty-shared/types';
import {
  canConnectedAccountPerformEmailOperation,
  isDefined,
} from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { EmailComposerFields } from '@/activities/emails/components/EmailComposerFields';
import { useAttachEmailFiles } from '@/activities/emails/hooks/useAttachEmailFiles';
import { useEmailComposerState } from '@/activities/emails/hooks/useEmailComposerState';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';
import { useInboxEmailToolCallDraft } from '@/inbox/tool-call-renderers/email/hooks/useInboxEmailToolCallDraft';
import { type InboxEmailComposerPrefill } from '@/inbox/tool-call-renderers/email/utils/getEmailComposerPrefillFromToolCall';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export type InboxEmailComposerHandle = {
  flushSave: () => Promise<void>;
  getInput: () => Record<string, unknown>;
};

type InboxEmailComposerProps = {
  prefill: InboxEmailComposerPrefill;
  // What the thread says about how to reply, filling whatever the proposal
  // left out. The proposal wins where both speak.
  replyDefaults?: Partial<
    Pick<InboxEmailComposerPrefill, 'to' | 'subject' | 'connectedAccountId' | 'inReplyTo'>
  >;
  contextRecord?: EmailComposerContextRecord | null;
  onSave?: (editedInput: Record<string, unknown>) => Promise<void>;
  // The run lives with whoever owns the button, and needs to flush the draft
  // first; a ref would do but a callback keeps the parent free of imperative
  // handles.
  onHandleChange: (handle: InboxEmailComposerHandle | null) => void;
};

// The real composer bound to a tool call: what the person types is the call's
// edited input, and what runs is the tool, never this component.
export const InboxEmailComposer = ({
  prefill,
  replyDefaults,
  contextRecord,
  onSave,
  onHandleChange,
}: InboxEmailComposerProps) => {
  const { data: accountsData } = useQuery<{
    myConnectedAccounts: Pick<
      ConnectedAccount,
      'id' | 'handle' | 'handleAliases' | 'provider' | 'connectionParameters'
    >[];
  }>(GET_MY_CONNECTED_ACCOUNTS);

  // With one sendable account there is no picker to choose it from, so it is
  // the sender unless the proposal or the thread named another.
  const sendableAccounts = (accountsData?.myConnectedAccounts ?? []).filter(
    (connectedAccount) =>
      canConnectedAccountPerformEmailOperation({
        connectedAccount,
        operation: EmailOperation.SEND,
      }),
  );
  const fallbackConnectedAccountId =
    sendableAccounts.length === 1 ? sendableAccounts[0].id : undefined;

  const resolvedPrefill: InboxEmailComposerPrefill = {
    ...prefill,
    to: prefill.to || (replyDefaults?.to ?? ''),
    subject: prefill.subject || (replyDefaults?.subject ?? ''),
    connectedAccountId:
      prefill.connectedAccountId ??
      replyDefaults?.connectedAccountId ??
      fallbackConnectedAccountId,
    inReplyTo: prefill.inReplyTo ?? replyDefaults?.inReplyTo,
  };

  const baseComposerState = useEmailComposerState({
    connectedAccountId: resolvedPrefill.connectedAccountId ?? '',
    draftPrefill: {
      messageId: '',
      to: resolvedPrefill.to,
      cc: resolvedPrefill.cc,
      bcc: resolvedPrefill.bcc,
      subject: resolvedPrefill.subject,
      body: resolvedPrefill.body,
    },
    defaultInReplyTo: resolvedPrefill.inReplyTo,
  });

  const { composerState, flushSave, getInput } = useInboxEmailToolCallDraft({
    composerState: baseComposerState,
    prefill: resolvedPrefill,
    onSave,
  });

  const { openAttachmentPicker } = useAttachEmailFiles({
    onFilesAttached: composerState.setFiles,
  });

  // Registration, not state sync: the parent needs a way to flush and read the
  // draft for as long as this composer is mounted.
  useEffect(() => {
    onHandleChange({ flushSave, getInput });

    return () => onHandleChange(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledCard>
      <EmailComposerFields
        composerState={composerState}
        contextRecord={isDefined(contextRecord) ? contextRecord : undefined}
        onAttachFiles={openAttachmentPicker}
      />
    </StyledCard>
  );
};
