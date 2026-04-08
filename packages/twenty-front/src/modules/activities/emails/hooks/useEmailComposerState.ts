import { useCallback, useState } from 'react';

import { useSendEmail } from '@/activities/emails/hooks/useSendEmail';

type UseEmailComposerStateArgs = {
  connectedAccountId: string;
  defaultTo?: string;
  defaultSubject?: string;
  defaultInReplyTo?: string;
  onSent?: () => void;
};

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

  const { sendEmail, loading } = useSendEmail();

  const canSend =
    to.trim().length > 0 && connectedAccountId.length > 0 && !loading;

  const handleSend = useCallback(async () => {
    if (!to.trim() || !connectedAccountId) {
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
    handleSend,
    loading,
    canSend,
    defaultTo,
    defaultSubject,
  };
};
