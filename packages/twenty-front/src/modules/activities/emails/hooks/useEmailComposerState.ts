import { useCallback, useMemo, useState } from 'react';
import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { type EmailAttachment } from 'twenty-shared/types';

import { useSendEmail } from '@/activities/emails/hooks/useSendEmail';
import { type EmailThreadDraftSeed } from '@/activities/emails/types/EmailThreadDraftSeed';

type UseEmailComposerStateArgs = {
  connectedAccountId: string;
  draftSeed?: EmailThreadDraftSeed | null;
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
  draftSeed,
  defaultTo = '',
  defaultSubject = '',
  defaultInReplyTo,
  onSent,
}: UseEmailComposerStateArgs) => {
  const initialTo = draftSeed?.to ?? defaultTo;
  const initialCc = draftSeed?.cc ?? '';
  const initialBcc = draftSeed?.bcc ?? '';
  const initialSubject = draftSeed?.subject ?? defaultSubject;
  const initialBody = draftSeed?.body ?? '';

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
      draftMessageId: draftSeed?.messageId,
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
    draftSeed?.messageId,
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
