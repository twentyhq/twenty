import { useCallback, useMemo, useState } from 'react';
import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { type EmailAttachment } from 'twenty-shared/types';

import { i18n } from '@lingui/core';
import { t } from '@lingui/core/macro';

import { useSendEmail } from '@/activities/emails/hooks/useSendEmail';
import { bodyMentionsAttachment } from '@/activities/emails/utils/bodyMentionsAttachment';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';

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
  const { enqueueDialog } = useDialogManager();

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

  const performSend = useCallback(async () => {
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
  ]);

  const handleSend = useCallback(async () => {
    if (!to.trim() || !connectedAccountId || exceedsRecipientLimit) {
      return;
    }

    const locale = i18n.locale;

    const hasNoAttachments = files.length === 0;
    const mentionsAttachment =
      bodyMentionsAttachment(body, locale) ||
      bodyMentionsAttachment(subject, locale);

    if (hasNoAttachments && mentionsAttachment) {
      enqueueDialog({
        title: t`Missing attachment?`,
        message: t`It looks like you meant to attach a file but didn't. Send anyway?`,
        buttons: [
          { title: t`Cancel`, variant: 'secondary' },
          {
            title: t`Send anyway`,
            onClick: performSend,
            variant: 'primary',
            accent: 'blue',
            role: 'confirm',
          },
        ],
      });

      return;
    }

    await performSend();
  }, [
    to,
    connectedAccountId,
    exceedsRecipientLimit,
    body,
    subject,
    files,
    enqueueDialog,
    performSend,
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
