import { type SetStateAction, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { serializeEmailRecipients } from '@/activities/emails/recipients/utils/serializeEmailRecipients';
import { type EmailComposerState } from '@/activities/emails/types/EmailComposerState';
import { buildEmailToolCallInput } from '@/inbox/tool-call-renderers/email/utils/buildEmailToolCallInput';
import { type InboxEmailComposerPrefill } from '@/inbox/tool-call-renderers/email/utils/getEmailComposerPrefillFromToolCall';

const SAVE_DEBOUNCE_MS = 600;

const resolveSetStateAction = <TValue,>(
  action: SetStateAction<TValue>,
  current: TValue,
): TValue =>
  typeof action === 'function'
    ? (action as (previous: TValue) => TValue)(current)
    : action;

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
  const draftRef = useRef<InboxEmailComposerPrefill>(prefill);
  const pendingSaveRef = useRef<Promise<void> | null>(null);

  // The sender can be decided after mount, once the accounts have loaded, and
  // that decision lives in the composer's state rather than in a keystroke.
  // Read live so a save or a send carries whichever account is current.
  const latestComposerStateRef = useRef(composerState);

  latestComposerStateRef.current = composerState;

  // Recipients come from the composer's chips rather than the raw prefill, so
  // an untouched "Name <address>" default is sent as the address, exactly as
  // the standalone composer would send it.
  const getInput = () =>
    buildEmailToolCallInput({
      ...draftRef.current,
      to: serializeEmailRecipients(latestComposerStateRef.current.to),
      cc: serializeEmailRecipients(latestComposerStateRef.current.cc),
      bcc: serializeEmailRecipients(latestComposerStateRef.current.bcc),
      connectedAccountId:
        draftRef.current.connectedAccountId ??
        latestComposerStateRef.current.connectedAccountId,
      fromHandle:
        draftRef.current.fromHandle ?? latestComposerStateRef.current.fromHandle,
    });

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

  const scheduleSave = () => debouncedSave();

  const patchDraft = (partial: Partial<InboxEmailComposerPrefill>) => {
    draftRef.current = { ...draftRef.current, ...partial };
    scheduleSave();
  };

  // Whatever is still debounced lands before a run reads the row, and a save
  // already on the wire is waited for rather than raced.
  const flushSave = async () => {
    debouncedSave.flush();
    await pendingSaveRef.current;
  };

  const composerStateWithSaves: EmailComposerState = {
    ...composerState,
    setTo: (action) => {
      const to = resolveSetStateAction(action, composerState.to);

      composerState.setTo(to);
      scheduleSave();
    },
    setCc: (action) => {
      const cc = resolveSetStateAction(action, composerState.cc);

      composerState.setCc(cc);
      scheduleSave();
    },
    setBcc: (action) => {
      const bcc = resolveSetStateAction(action, composerState.bcc);

      composerState.setBcc(bcc);
      scheduleSave();
    },
    setSubject: (action) => {
      const subject = resolveSetStateAction(action, composerState.subject);

      composerState.setSubject(subject);
      patchDraft({ subject });
    },
    setBody: (action) => {
      const body = resolveSetStateAction(action, composerState.body);

      composerState.setBody(body);
      patchDraft({ body });
    },
    setSender: (action) => {
      const sender = resolveSetStateAction(action, {
        connectedAccountId: composerState.connectedAccountId,
        fromHandle: composerState.fromHandle,
      });

      composerState.setSender(sender);
      patchDraft({
        connectedAccountId: sender.connectedAccountId,
        fromHandle: sender.fromHandle,
      });
    },
  };

  return { composerState: composerStateWithSaves, flushSave, getInput };
};
