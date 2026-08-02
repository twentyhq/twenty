import { useCallback, useEffect, useRef, useState } from 'react';

import { useMessageCampaignDraft } from '@/activities/emails/hooks/useMessageCampaignDraft';
import { useSendMessageCampaign } from '@/activities/emails/hooks/useSendMessageCampaign';

type UseCampaignComposerStateArgs = {
  campaignId?: string;
  initialValues?: {
    unsubscribeTopicId?: string | null;
    listId?: string | null;
    fromAddress?: string | null;
    subject?: string | null;
    body?: string | null;
  };
  autoSaveDraft?: boolean;
  onSent?: () => void;
};

export const useCampaignComposerState = ({
  campaignId,
  initialValues,
  autoSaveDraft = true,
  onSent,
}: UseCampaignComposerStateArgs) => {
  const [unsubscribeTopicId, setUnsubscribeTopicId] = useState<string | null>(
    initialValues?.unsubscribeTopicId ?? null,
  );
  const [listId, setListId] = useState<string | null>(
    initialValues?.listId ?? null,
  );
  const [fromAddress, setFromAddress] = useState(
    initialValues?.fromAddress ?? '',
  );
  const [subject, setSubject] = useState(initialValues?.subject ?? '');
  const [body, setBody] = useState(initialValues?.body ?? '');
  const [draftCampaignId, setDraftCampaignId] = useState(campaignId);
  const [draftSaveStatus, setDraftSaveStatus] = useState<
    'saving' | 'saved' | 'error'
  >('saving');
  // oxlint-disable-next-line twenty/no-state-useref -- A ref prevents React Strict Mode from creating the same server-side draft twice.
  const hasStartedDraftCreation = useRef(false);

  const { sendMessageCampaign, loading: isSending } = useSendMessageCampaign();
  const { saveDraft, isSaving } = useMessageCampaignDraft();

  const saveCurrentDraft = useCallback(async () => {
    setDraftSaveStatus('saving');
    const savedDraft = await saveDraft({
      campaignId: draftCampaignId,
      listId,
      unsubscribeTopicId,
      subject,
      body,
      fromAddress: fromAddress.trim().length === 0 ? null : fromAddress.trim(),
    });

    setDraftSaveStatus(savedDraft === null ? 'error' : 'saved');

    if (savedDraft !== null && draftCampaignId === undefined) {
      setDraftCampaignId(savedDraft.campaignId);
    }

    return savedDraft?.campaignId ?? draftCampaignId;
  }, [
    body,
    draftCampaignId,
    fromAddress,
    listId,
    saveDraft,
    subject,
    unsubscribeTopicId,
  ]);

  useEffect(() => {
    if (
      !autoSaveDraft ||
      draftCampaignId !== undefined ||
      hasStartedDraftCreation.current
    ) {
      return;
    }

    hasStartedDraftCreation.current = true;
    void saveCurrentDraft();
  }, [autoSaveDraft, draftCampaignId, saveCurrentDraft]);

  useEffect(() => {
    if (!autoSaveDraft || draftCampaignId === undefined) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void saveCurrentDraft();
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [autoSaveDraft, draftCampaignId, saveCurrentDraft]);

  const canSend =
    listId !== null &&
    fromAddress.trim().length > 0 &&
    subject.trim().length > 0 &&
    !isSending;

  const handleSend = async () => {
    if (listId === null || !canSend) {
      return;
    }

    const savedCampaignId = autoSaveDraft
      ? await saveCurrentDraft()
      : draftCampaignId;

    if (autoSaveDraft && savedCampaignId === undefined) {
      return;
    }

    const success = await sendMessageCampaign({
      ...(savedCampaignId === undefined ? {} : { campaignId: savedCampaignId }),
      listId,
      unsubscribeTopicId: unsubscribeTopicId ?? undefined,
      subject,
      body,
      fromAddress: fromAddress.trim(),
    });

    if (success) {
      onSent?.();
    }
  };

  return {
    unsubscribeTopicId,
    setUnsubscribeTopicId,
    listId,
    setListId,
    fromAddress,
    setFromAddress,
    subject,
    setSubject,
    body,
    setBody,
    draftCampaignId,
    saveCurrentDraft,
    handleSend,
    canSend,
    loading: isSending,
    isSaving,
    draftSaveStatus,
  };
};
