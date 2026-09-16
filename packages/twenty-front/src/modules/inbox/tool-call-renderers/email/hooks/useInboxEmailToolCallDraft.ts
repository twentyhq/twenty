import { type Dispatch, type SetStateAction, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { serializeEmailRecipients } from '@/activities/emails/recipients/utils/serializeEmailRecipients';
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
}: {
  composerState: EmailComposerState;
  prefill: InboxEmailComposerPrefill;
  onSave?: (editedInput: Record<string, unknown>) => Promise<void>;
}) => {
  // Mirrors, not state: nothing renders from them. The composer's state is
  // read live so a save or a send carries what is on screen, including a
  // sender the composer picked after mount; a save already on the wire is
  // awaited by the run that follows rather than raced.
  // oxlint-disable-next-line twenty/no-state-useref
  const latestComposerStateRef = useRef(composerState);
  // oxlint-disable-next-line twenty/no-state-useref
  const pendingSaveRef = useRef<Promise<void> | null>(null);

  latestComposerStateRef.current = composerState;

  // Recipients are serialized from the composer's chips, so an untouched
  // "Name <address>" default is sent as the address, exactly as the standalone
  // composer would send it.
  const getInput = () => {
    const { to, cc, bcc, subject, body, connectedAccountId, fromHandle } =
      latestComposerStateRef.current;

    return buildEmailToolCallInput({
      to: serializeEmailRecipients(to),
      cc: serializeEmailRecipients(cc),
      bcc: serializeEmailRecipients(bcc),
      subject,
      body,
      connectedAccountId,
      fromHandle,
      inReplyTo: prefill.inReplyTo,
    });
  };

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
  const flushSave = async () => {
    debouncedSave.flush();
    await pendingSaveRef.current;
  };

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
    setSender: withSave(composerState.setSender),
  };

  return { composerState: composerStateWithSaves, flushSave, getInput };
};
