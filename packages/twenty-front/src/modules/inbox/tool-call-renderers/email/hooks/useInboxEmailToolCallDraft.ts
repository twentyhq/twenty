import { isNonEmptyString } from '@sniptt/guards';
import { type Dispatch, type SetStateAction, useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { serializeEmailRecipients } from '@/activities/emails/recipients/utils/serializeEmailRecipients';
import { type ConnectedAccountSender } from '@/accounts/types/ConnectedAccountSender';
import { type EmailComposerState } from '@/activities/emails/types/EmailComposerState';
import { buildEmailToolCallInput } from '@/inbox/tool-call-renderers/email/utils/buildEmailToolCallInput';
import { type InboxEmailComposerPrefill } from '@/inbox/tool-call-renderers/email/utils/getEmailComposerPrefillFromToolCall';

const SAVE_DEBOUNCE_MS = 600;

// The draft is the tool call's edited input, so a half-written reply survives
// the poll, a reload and a handover. The composer's setters are wrapped rather
// than its state observed: a save belongs to the keystroke that caused it, and
// an effect watching the state would also fire on mount and on every poll.
export const useInboxEmailToolCallDraft = ({
  composerState,
  prefill,
  onSave,
  onSenderChange,
}: {
  composerState: EmailComposerState;
  prefill: InboxEmailComposerPrefill;
  onSave?: (editedInput: Record<string, unknown>) => Promise<void>;
  onSenderChange?: (hasSender: boolean) => void;
}) => {
  // Mirrors, not state: nothing renders from them. The composer's state is
  // read live so a save or a send carries what is on screen, including a
  // sender the composer picked after mount; a save already on the wire is
  // awaited by the run that follows rather than raced. Reading through the
  // ref is also what keeps getInput and flushSave stable, which the handle
  // exposed to the parent needs.
  // oxlint-disable-next-line twenty/no-state-useref
  const latestRef = useRef({ composerState, inReplyTo: prefill.inReplyTo });
  // oxlint-disable-next-line twenty/no-state-useref
  const pendingSaveRef = useRef<Promise<void> | null>(null);

  latestRef.current = { composerState, inReplyTo: prefill.inReplyTo };

  // Recipients are serialized from the composer's chips, so an untouched
  // "Name <address>" default is sent as the address, exactly as the standalone
  // composer would send it.
  const getInput = useCallback(() => {
    const { composerState: current, inReplyTo } = latestRef.current;

    return buildEmailToolCallInput({
      to: serializeEmailRecipients(current.to),
      cc: serializeEmailRecipients(current.cc),
      bcc: serializeEmailRecipients(current.bcc),
      subject: current.subject,
      body: current.body,
      connectedAccountId: current.connectedAccountId,
      fromHandle: current.fromHandle,
      inReplyTo,
    });
  }, []);

  const save = () => {
    if (!onSave) {
      return;
    }

    const pendingSave = onSave(getInput()).finally(() => {
      if (pendingSaveRef.current === pendingSave) {
        pendingSaveRef.current = null;
      }
    });

    pendingSaveRef.current = pendingSave;
  };

  const debouncedSave = useDebouncedCallback(save, SAVE_DEBOUNCE_MS);

  // Whatever is still debounced lands before a run reads the row, and a save
  // already on the wire is waited for rather than raced.
  const flushSave = useCallback(async () => {
    debouncedSave.flush();
    await pendingSaveRef.current;
  }, [debouncedSave]);

  const withSave =
    <TValue>(
      setter: Dispatch<SetStateAction<TValue>>,
    ): Dispatch<SetStateAction<TValue>> =>
    (action) => {
      setter(action);
      debouncedSave();
    };

  const composerStateWithSaves: EmailComposerState = {
    ...composerState,
    setTo: withSave(composerState.setTo),
    setCc: withSave(composerState.setCc),
    setBcc: withSave(composerState.setBcc),
    setSubject: withSave(composerState.setSubject),
    setBody: withSave(composerState.setBody),
    // The sender is the one field whoever owns the Send button needs to know
    // about, since there is nothing to send without one.
    setSender: (action) => {
      const sender: ConnectedAccountSender =
        typeof action === 'function'
          ? action({
              connectedAccountId: composerState.connectedAccountId,
              fromHandle: composerState.fromHandle,
            })
          : action;

      composerState.setSender(sender);
      onSenderChange?.(isNonEmptyString(sender.connectedAccountId));
      debouncedSave();
    },
  };

  return { composerState: composerStateWithSaves, flushSave, getInput };
};
