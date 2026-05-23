import { useQuery } from '@apollo/client/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { type EmailAttachment } from 'twenty-shared/types';

import { useSendEmail } from '@/activities/emails/hooks/useSendEmail';
import { getEmailBodyWithSignature } from '@/activities/emails/utils/getEmailBodyWithSignature';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';

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
  const [bodyFieldKey, setBodyFieldKey] = useState(0);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [files, setFiles] = useState<EmailAttachment[]>([]);
  const [hasEditedBody, setHasEditedBody] = useState(false);

  const { sendEmail, loading } = useSendEmail();
  const { data: connectedAccountsData } = useQuery<{
    myConnectedAccounts: {
      id: string;
      emailSignature: string | null;
    }[];
  }>(GET_MY_CONNECTED_ACCOUNTS);

  const emailSignature = useMemo(
    () =>
      connectedAccountsData?.myConnectedAccounts.find(
        (account) => account.id === connectedAccountId,
      )?.emailSignature,
    [connectedAccountsData?.myConnectedAccounts, connectedAccountId],
  );

  useEffect(() => {
    if (hasEditedBody) {
      return;
    }

    setBody(getEmailBodyWithSignature(emailSignature));
    setBodyFieldKey((previousKey) => previousKey + 1);
  }, [emailSignature, hasEditedBody]);

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

  const handleBodyChange = useCallback((value: string) => {
    setHasEditedBody(true);
    setBody(value);
  }, []);

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
    setBody: handleBodyChange,
    bodyFieldKey,
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
