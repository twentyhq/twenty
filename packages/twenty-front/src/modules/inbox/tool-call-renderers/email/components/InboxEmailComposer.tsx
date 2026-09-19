import { styled } from '@linaria/react';
import { useQuery } from '@apollo/client/react';
import { forwardRef, useImperativeHandle } from 'react';
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

// The fields grow into whatever height they are given; in a scrolling pane
// that is nothing, so this sets the floor the body writes into. No border of
// its own: whoever places the composer draws the frame around it.
const StyledComposer = styled.div`
  background: ${themeCssVariables.background.primary};
  display: flex;
  flex-direction: column;
  min-height: 360px;
  overflow: hidden;
`;

export type InboxEmailComposerHandle = {
  flushSave: () => Promise<boolean>;
  getInput: () => Record<string, unknown>;
};

type InboxEmailComposerProps = {
  prefill: InboxEmailComposerPrefill;
  // What the thread says about how to reply, filling whatever the proposal
  // left out. The proposal wins where both speak.
  replyDefaults?: Partial<
    Pick<
      InboxEmailComposerPrefill,
      'to' | 'subject' | 'connectedAccountId' | 'inReplyTo'
    >
  >;
  contextRecord?: EmailComposerContextRecord | null;
  onSave?: (editedInput: Record<string, unknown>) => Promise<boolean>;
};

// The real composer bound to a tool call: what the person types is the call's
// edited input, and what runs is the tool, never this component. The run
// lives with whoever owns the button, which reaches the draft through the
// handle: flush what is still debounced, or read the input for a new call.
export const InboxEmailComposer = forwardRef<
  InboxEmailComposerHandle,
  InboxEmailComposerProps
>(({ prefill, replyDefaults, contextRecord, onSave }, ref) => {
  const { data: accountsData } = useQuery<{
    myConnectedAccounts: Pick<
      ConnectedAccount,
      'id' | 'handle' | 'handleAliases' | 'provider' | 'connectionParameters'
    >[];
  }>(GET_MY_CONNECTED_ACCOUNTS);

  // The first mailbox the viewer may send from is the sender unless the
  // proposal or the thread named another, so a reply never starts without one.
  const sendableAccounts = (accountsData?.myConnectedAccounts ?? []).filter(
    (connectedAccount) =>
      canConnectedAccountPerformEmailOperation({
        connectedAccount,
        operation: EmailOperation.SEND,
      }),
  );
  const fallbackConnectedAccountId = sendableAccounts[0]?.id;

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

  useImperativeHandle(ref, () => ({ flushSave, getInput }), [
    flushSave,
    getInput,
  ]);

  return (
    <StyledComposer>
      <EmailComposerFields
        composerState={composerState}
        contextRecord={isDefined(contextRecord) ? contextRecord : undefined}
        onAttachFiles={openAttachmentPicker}
      />
    </StyledComposer>
  );
});
