import { useCallback, useMemo, useState } from 'react';
import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { type EmailAttachment } from 'twenty-shared/types';

import { useSendEmail } from '@/activities/emails/hooks/useSendEmail';

type UseEmailComposerStateArgs = {
  connectedAccountId: string;
  defaultTo?: string;
  defaultSubject?: string;
  defaultInReplyTo?: string;
  onSent?: () => void;
};

const countRecipients = (csv: string): number =>
  csv
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0).length;

export const useEmailComposerState = ({
  connectedAccountId: initialConnectedAccountId,
  defaultTo = '',
  defaultSubject = '',
  defaultInReplyTo,
  onSent,
}: UseEmailComposerStateArgs) => {
  const [connectedAccountId, setConnectedAccountId] = useState(
    initialConnectedAccountId,
  );
  const [to, setTo] = useState(defaultTo);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
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

    const success = await sendEmail({
      connectedAccountId,
      to: trimmedTo,
      cc: trimmedCc || undefined,
      bcc: trimmedBcc || undefined,
      subject,
      body,
      inReplyTo: defaultInReplyTo,
      files: files.length > 0 ? files : undefined,
    });

    if (success) {
      onSent?.();
    }
  }, [
    connectedAccountId,
    to,
    cc,
    bcc,
    subject,
    body,
    defaultInReplyTo,
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
    defaultTo,
    defaultSubject,
    recipientCount,
    exceedsRecipientLimit,
    maxRecipients: MAX_EMAIL_RECIPIENTS,
  };
};
