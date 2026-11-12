import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useCallback, useMemo, useState } from 'react';
import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { type EmailAttachment } from 'twenty-shared/types';

import { useSendAppChannelMessage } from '@/activities/emails/hooks/useSendAppChannelMessage';
import { useSendEmail } from '@/activities/emails/hooks/useSendEmail';
import { type AppReplyTarget } from '@/activities/emails/types/AppReplyTarget';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { v4 } from 'uuid';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { isValidEmailRecipientAddress } from '@/activities/emails/recipients/utils/isValidEmailRecipientAddress';
import { parseEmailRecipients } from '@/activities/emails/recipients/utils/parseEmailRecipients';
import { serializeEmailRecipients } from '@/activities/emails/recipients/utils/serializeEmailRecipients';
import { type ConnectedAccountSender } from '@/accounts/types/ConnectedAccountSender';
import { type EmailDraftPrefill } from '@/activities/emails/types/EmailDraftPrefill';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';

type UseEmailComposerStateArgs = {
  connectedAccountId: string;
  draftPrefill?: EmailDraftPrefill | null;
  defaultTo?: string;
  defaultSubject?: string;
  defaultInReplyTo?: string;
  contextRecord?: EmailComposerContextRecord | null;
  appReplyTarget?: AppReplyTarget | null;
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
  contextRecord,
  appReplyTarget,
  onSent,
}: UseEmailComposerStateArgs) => {
  const initialTo = draftPrefill?.to ?? defaultTo;
  const initialCc = draftPrefill?.cc ?? '';
  const initialBcc = draftPrefill?.bcc ?? '';
  const initialSubject = draftPrefill?.subject ?? defaultSubject;
  const initialBody = draftPrefill?.body ?? '';

  const [sender, setSender] = useState<ConnectedAccountSender>({
    connectedAccountId: initialConnectedAccountId,
  });
  const [previousConnectedAccountId, setPreviousConnectedAccountId] = useState(
    initialConnectedAccountId,
  );

  if (previousConnectedAccountId !== initialConnectedAccountId) {
    setPreviousConnectedAccountId(initialConnectedAccountId);
    setSender({ connectedAccountId: initialConnectedAccountId });
  }

  const { connectedAccountId, fromHandle } = sender;
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
  const [attachedFiles, setFiles] = useState<EmailAttachment[]>([]);

  const isSendingThroughAppSender =
    isDefined(appReplyTarget) &&
    appReplyTarget.connectedAccountId === connectedAccountId;

  // app sends carry no files: hide them, including uploads that finish after switching to the app
  const files = isSendingThroughAppSender ? [] : attachedFiles;

  const { sendEmail, loading: isSendingEmail } = useSendEmail();
  const { sendAppChannelMessage } = useSendAppChannelMessage();
  const [isSendingThroughApp, setIsSendingThroughApp] = useState(false);
  const { enqueueToast } = useToast();
  const [pendingAppSend, setPendingAppSend] = useState<{
    emailKey: string;
    idempotencyKey: string;
  } | null>(null);
  const loading = isSendingEmail || isSendingThroughApp;

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

    if (isSendingThroughAppSender) {
      setIsSendingThroughApp(true);

      const email = {
        to: serializeEmailRecipients(to),
        cc: serializedCc || undefined,
        bcc: serializedBcc || undefined,
        subject,
        body,
        inReplyTo: defaultInReplyTo || undefined,
      };
      const emailKey = JSON.stringify(email);

      // a retry of the same email reuses its key so the server does not deliver it twice
      const idempotencyKey =
        pendingAppSend?.emailKey === emailKey
          ? pendingAppSend.idempotencyKey
          : v4();

      setPendingAppSend({ emailKey, idempotencyKey });

      try {
        const sentMessage = await sendAppChannelMessage({
          messageChannelId: appReplyTarget.messageChannelId,
          messageThreadId: appReplyTarget.messageThreadId,
          idempotencyKey,
          email,
        });

        setPendingAppSend(null);
        onSent?.(sentMessage?.messageThreadId ?? null);
      } catch (error) {
        enqueueToast({
          status: 'error',
          children: CombinedGraphQLErrors.is(error)
            ? getErrorMessageFromApolloError(error)
            : t`Failed to send email`,
        });
      } finally {
        setIsSendingThroughApp(false);
      }

      return;
    }

    const { success, messageThreadId } = await sendEmail({
      connectedAccountId,
      fromHandle,
      to: serializeEmailRecipients(to),
      cc: serializedCc || undefined,
      bcc: serializedBcc || undefined,
      subject,
      body,
      inReplyTo: defaultInReplyTo,
      draftMessageId: draftPrefill?.messageId,
      files: files.length > 0 ? files : undefined,
      targetRecord: contextRecord ?? undefined,
    });

    if (success) {
      onSent?.(messageThreadId);
    }
  }, [
    canSend,
    connectedAccountId,
    fromHandle,
    to,
    cc,
    bcc,
    subject,
    body,
    defaultInReplyTo,
    draftPrefill?.messageId,
    files,
    contextRecord,
    appReplyTarget,
    isSendingThroughAppSender,
    pendingAppSend,
    sendEmail,
    sendAppChannelMessage,
    enqueueToast,
    onSent,
  ]);

  return {
    connectedAccountId,
    fromHandle,
    setSender,
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
