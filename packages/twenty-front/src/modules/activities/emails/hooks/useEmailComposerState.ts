import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { type SetStateAction, useCallback, useMemo, useState } from 'react';
import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { type EmailAttachment } from 'twenty-shared/types';

import { useComposerDraft } from '@/activities/emails/hooks/useComposerDraft';
import { useSendAppChannelMessage } from '@/activities/emails/hooks/useSendAppChannelMessage';
import { useSendEmail } from '@/activities/emails/hooks/useSendEmail';
import { emailComposerDraftFamilyState } from '@/activities/emails/states/emailComposerDraftFamilyState';
import { type AppReplyTarget } from '@/activities/emails/types/AppReplyTarget';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { v4 } from 'uuid';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { type EmailRecipientsByFieldId } from '@/activities/emails/recipients/types/EmailRecipientsByFieldId';
import { isValidEmailRecipientAddress } from '@/activities/emails/recipients/utils/isValidEmailRecipientAddress';
import { parseEmailRecipients } from '@/activities/emails/recipients/utils/parseEmailRecipients';
import { serializeEmailRecipients } from '@/activities/emails/recipients/utils/serializeEmailRecipients';
import { type ConnectedAccountSender } from '@/accounts/types/ConnectedAccountSender';
import { type EmailComposerDraft } from '@/activities/emails/types/EmailComposerDraft';
import { type EmailDraftPrefill } from '@/activities/emails/types/EmailDraftPrefill';
import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';

type UseEmailComposerStateArgs = {
  connectedAccountId: string;
  draftPrefill?: EmailDraftPrefill | null;
  defaultTo?: string;
  defaultCc?: string;
  defaultSubject?: string;
  defaultInReplyTo?: string;
  contextRecord?: EmailComposerContextRecord | null;
  appReplyTarget?: AppReplyTarget | null;
  draftKey?: string;
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
  defaultCc = '',
  defaultSubject = '',
  defaultInReplyTo,
  contextRecord,
  appReplyTarget,
  draftKey,
  onSent,
}: UseEmailComposerStateArgs) => {
  const [initialDraft] = useState<EmailComposerDraft>(() => ({
    recipientsByFieldId: {
      to: parseEmailRecipients(draftPrefill?.to ?? defaultTo),
      cc: parseEmailRecipients(draftPrefill?.cc ?? defaultCc),
      bcc: parseEmailRecipients(draftPrefill?.bcc ?? ''),
    },
    subject: draftPrefill?.subject ?? defaultSubject,
    body:
      draftPrefill?.body ?? serializePlainTextAsAdvancedTextEditorDocument(''),
    files: [],
    pickedSender: null,
    pendingAppSend: null,
  }));
  const [storedDraft, setStoredDraft] = useComposerDraft({
    draftFamilyState: emailComposerDraftFamilyState,
    draftKey,
    defaultDraft: null,
  });
  const {
    recipientsByFieldId,
    subject,
    body,
    files,
    pickedSender,
    pendingAppSend,
  } = storedDraft ?? initialDraft;
  const { to, cc, bcc } = recipientsByFieldId;

  const updateDraft = (
    getChanges: (draft: EmailComposerDraft) => Partial<EmailComposerDraft>,
  ) =>
    setStoredDraft((previousDraft) => {
      const draft = previousDraft ?? initialDraft;

      return { ...draft, ...getChanges(draft) };
    });

  const setRecipientsByFieldId = (
    update: SetStateAction<EmailRecipientsByFieldId>,
  ) =>
    updateDraft((draft) => ({
      recipientsByFieldId:
        typeof update === 'function'
          ? update(draft.recipientsByFieldId)
          : update,
    }));

  const setSubject = (nextSubject: string) =>
    updateDraft(() => ({ subject: nextSubject }));

  const setBody = (nextBody: string) => updateDraft(() => ({ body: nextBody }));

  const setFiles = (update: SetStateAction<EmailAttachment[]>) =>
    updateDraft((draft) => ({
      files: typeof update === 'function' ? update(draft.files) : update,
    }));

  const setSender = (sender: ConnectedAccountSender) =>
    updateDraft(() => ({
      pickedSender: {
        defaultConnectedAccountId: initialConnectedAccountId,
        sender,
      },
    }));

  const { connectedAccountId, fromHandle } =
    pickedSender?.defaultConnectedAccountId === initialConnectedAccountId
      ? pickedSender.sender
      : { connectedAccountId: initialConnectedAccountId };

  const isSendingThroughAppSender =
    isDefined(appReplyTarget) &&
    appReplyTarget.connectedAccountId === connectedAccountId;

  const { sendEmail, loading: isSendingEmail } = useSendEmail();
  const { sendAppChannelMessage } = useSendAppChannelMessage();
  const [isSendingThroughApp, setIsSendingThroughApp] = useState(false);
  const { enqueueToast } = useToast();
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
      const emailKey = JSON.stringify({ email, files });

      // a retry of the same email reuses its key so the server does not deliver it twice
      const idempotencyKey =
        pendingAppSend?.emailKey === emailKey
          ? pendingAppSend.idempotencyKey
          : v4();

      setStoredDraft((previousDraft) => ({
        ...(previousDraft ?? initialDraft),
        pendingAppSend: { emailKey, idempotencyKey },
      }));

      try {
        const sentMessage = await sendAppChannelMessage({
          messageChannelId: appReplyTarget.messageChannelId,
          messageThreadId: appReplyTarget.messageThreadId,
          idempotencyKey,
          email,
          attachments: files,
        });

        setStoredDraft(null);
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
      setStoredDraft(null);
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
    setStoredDraft,
    initialDraft,
    onSent,
  ]);

  return {
    connectedAccountId,
    fromHandle,
    setSender,
    recipientsByFieldId,
    setRecipientsByFieldId,
    subject,
    setSubject,
    body,
    setBody,
    files,
    setFiles,
    discardDraft: () => setStoredDraft(null),
    handleSend,
    loading,
    canSend,
    recipientCount,
    exceedsRecipientLimit,
    maxRecipients: MAX_EMAIL_RECIPIENTS,
  };
};
