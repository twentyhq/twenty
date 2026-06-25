import { useCallback, useMemo, useState } from 'react';
import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { type EmailAttachment } from 'twenty-shared/types';

import { useSendEmail } from '@/activities/emails/hooks/useSendEmail';
import { type EmailDraftPrefill } from '@/activities/emails/types/EmailDraftPrefill';

type UseEmailComposerStateArgs = {
  connectedAccountId: string;
  draftPrefill?: EmailDraftPrefill | null;
  defaultTo?: string;
  defaultSubject?: string;
  defaultInReplyTo?: string;
  onSent?: (messageThreadId: string | null) => void;
};

const countRecipients = (csv: string): number =>
  csv
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0).length;

export const useEmailComposerState = ({
  connectedAccountId: initialConnectedAccountId,
  draftPrefill,
  defaultTo = '',
  defaultSubject = '',
  defaultInReplyTo,
  onSent,
}: UseEmailComposerStateArgs) => {
  const initialTo = draftPrefill?.to ?? defaultTo;
  const initialCc = draftPrefill?.cc ?? '';
  const initialBcc = draftPrefill?.bcc ?? '';
  const initialSubject = draftPrefill?.subject ?? defaultSubject;
  const initialBody = draftPrefill?.body ?? '';

  const [connectedAccountId, setConnectedAccountId] = useState(
    initialConnectedAccountId,
  );
  const [to, setTo] = useState(initialTo);
  const [cc, setCc] = useState(initialCc);
  const [bcc, setBcc] = useState(initialBcc);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [showCcBcc, setShowCcBcc] = useState(
    initialCc.length > 0 || initialBcc.length > 0,
  );
  const [files, setFiles] = useState<EmailAttachment[]>([]);

  const { sendEmail, loading } = useSendEmail();

  const recipientCount = useMemo(
    () => countRecipients(to) + countRecipients(cc) + countRecipients(bcc),
    [to, cc, bcc],
  );

  const exceedsRecipientLimit = recipientCount > MAX_EMAIL_RECIPIENTS;

  const canSend =
    to.trim().length > 0 &&
    connectedAccountId.length > 0 &&
    !loading &&
    !exceedsRecipientLimit;

  const handleSend = useCallback(async () => {
    if (!to.trim() || !connectedAccountId || exceedsRecipientLimit) {
      return;
    }

    const trimmedTo = to.trim();
    const trimmedCc = cc.trim();
    const trimmedBcc = bcc.trim();

    const { success, messageThreadId } = await sendEmail({
      connectedAccountId,
      to: trimmedTo,
      cc: trimmedCc || undefined,
      bcc: trimmedBcc || undefined,
      subject,
      body,
      inReplyTo: defaultInReplyTo,
      draftMessageId: draftPrefill?.messageId,
      files: files.length > 0 ? files : undefined,
    });

    if (success) {
      onSent?.(messageThreadId);
    }
  }, [
    connectedAccountId,
    to,
    cc,
    bcc,
    subject,
    body,
    defaultInReplyTo,
    draftPrefill?.messageId,
    files,
    sendEmail,
    onSent,
    exceedsRecipientLimit,
  ]);

  return {
    connectedAccountId,
    setConnectedAccountId,
    to,
    setTo,
    cc,
    setCc,
    bcc,
    setBcc,
    subject,
    setSubject,
    body,
    setBody,
    showCcBcc,
    setShowCcBcc,
    files,
    setFiles,
    handleSend,
    loading,
    canSend,
    initialTo,
    initialCc,
    initialBcc,
    initialSubject,
    initialBody,
    recipientCount,
    exceedsRecipientLimit,
    maxRecipients: MAX_EMAIL_RECIPIENTS,
  };
};
