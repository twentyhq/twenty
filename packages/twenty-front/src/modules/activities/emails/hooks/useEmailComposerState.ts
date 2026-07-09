import { useCallback, useMemo, useState } from 'react';
import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { type EmailAttachment } from 'twenty-shared/types';

import { useSendEmail } from '@/activities/emails/hooks/useSendEmail';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { isValidEmailRecipientAddress } from '@/activities/emails/recipients/utils/isValidEmailRecipientAddress';
import { parseEmailRecipients } from '@/activities/emails/recipients/utils/parseEmailRecipients';
import { serializeEmailRecipients } from '@/activities/emails/recipients/utils/serializeEmailRecipients';
import { type EmailDraftPrefill } from '@/activities/emails/types/EmailDraftPrefill';

type UseEmailComposerStateArgs = {
  connectedAccountId: string;
  draftPrefill?: EmailDraftPrefill | null;
  defaultTo?: string;
  defaultSubject?: string;
  defaultInReplyTo?: string;
  onSent?: (messageThreadId: string | null) => void;
};

const hasInvalidRecipient = (recipients: EmailRecipient[]): boolean =>
  recipients.some(
    (recipient) => !isValidEmailRecipientAddress(recipient.address),
  );

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
  const [to, setTo] = useState<EmailRecipient[]>(() =>
    parseEmailRecipients(initialTo),
  );
  const [cc, setCc] = useState<EmailRecipient[]>(() =>
    parseEmailRecipients(initialCc),
  );
  const [bcc, setBcc] = useState<EmailRecipient[]>(() =>
    parseEmailRecipients(initialBcc),
  );
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [showCcBcc, setShowCcBcc] = useState(
    initialCc.length > 0 || initialBcc.length > 0,
  );
  const [files, setFiles] = useState<EmailAttachment[]>([]);

  const { sendEmail, loading } = useSendEmail();

  const recipientCount = to.length + cc.length + bcc.length;

  const exceedsRecipientLimit = recipientCount > MAX_EMAIL_RECIPIENTS;

  const hasInvalidRecipients = useMemo(
    () =>
      hasInvalidRecipient(to) ||
      hasInvalidRecipient(cc) ||
      hasInvalidRecipient(bcc),
    [to, cc, bcc],
  );

  const canSend =
    to.length > 0 &&
    connectedAccountId.length > 0 &&
    !loading &&
    !exceedsRecipientLimit &&
    !hasInvalidRecipients;

  const handleSend = useCallback(async () => {
    if (!canSend) {
      return;
    }

    const serializedCc = serializeEmailRecipients(cc);
    const serializedBcc = serializeEmailRecipients(bcc);

    const { success, messageThreadId } = await sendEmail({
      connectedAccountId,
      to: serializeEmailRecipients(to),
      cc: serializedCc || undefined,
      bcc: serializedBcc || undefined,
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
    canSend,
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
    initialSubject,
    initialBody,
    recipientCount,
    exceedsRecipientLimit,
    maxRecipients: MAX_EMAIL_RECIPIENTS,
  };
};
