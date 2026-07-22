import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useDebouncedCallback } from 'use-debounce';

import { useSendMessageCampaign } from '@/activities/emails/hooks/useSendMessageCampaign';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';

type CampaignComposerDraft = {
  listId: string | null;
  unsubscribeTopicId: string | null;
  fromAddress: string;
  subject: string;
  body: string;
};

type UseCampaignComposerStateArgs = {
  campaign: MessageCampaign;
  onSent?: () => void;
};

export const useCampaignComposerState = ({
  campaign,
  onSent,
}: UseCampaignComposerStateArgs) => {
  const [draft, setDraft] = useState<CampaignComposerDraft>(() => ({
    listId: campaign.listId,
    unsubscribeTopicId: campaign.unsubscribeTopicId,
    fromAddress: campaign.fromAddress?.primaryEmail ?? '',
    subject: campaign.subject ?? '',
    body: campaign.bodyTemplate ?? '',
  }));

  const { updateOneRecord } = useUpdateOneRecord();

  const { enqueueErrorSnackBar } = useSnackBar();

  const { sendMessageCampaign, loading } = useSendMessageCampaign();

  const persistDraft = async (draftToPersist: CampaignComposerDraft) => {
    await updateOneRecord({
      objectNameSingular: CoreObjectNameSingular.MessageCampaign,
      idToUpdate: campaign.id,
      updateOneRecordInput: {
        listId: draftToPersist.listId,
        unsubscribeTopicId: draftToPersist.unsubscribeTopicId,
        fromAddress: {
          primaryEmail: draftToPersist.fromAddress.trim(),
          additionalEmails: null,
        },
        subject: draftToPersist.subject,
        bodyTemplate: draftToPersist.body,
      },
    });
  };

  const persistDraftDebounced = useDebouncedCallback(
    (draftToPersist: CampaignComposerDraft) => {
      persistDraft(draftToPersist).catch(() =>
        enqueueErrorSnackBar({ message: t`Failed to save the campaign draft` }),
      );
    },
    500,
  );

  const updateDraft = (partialDraft: Partial<CampaignComposerDraft>) => {
    const nextDraft = { ...draft, ...partialDraft };

    setDraft(nextDraft);
    persistDraftDebounced(nextDraft);
  };

  const canSend =
    draft.listId !== null &&
    draft.fromAddress.trim().length > 0 &&
    draft.subject.trim().length > 0 &&
    draft.body.trim().length > 0 &&
    !loading;

  const handleSend = async () => {
    if (!canSend) {
      return;
    }

    // The latest draft has to reach the server before the send reads it
    persistDraftDebounced.cancel();

    try {
      await persistDraft(draft);
    } catch {
      enqueueErrorSnackBar({ message: t`Failed to save the campaign draft` });

      return;
    }

    const success = await sendMessageCampaign({ campaignId: campaign.id });

    if (success) {
      onSent?.();
    }
  };

  return {
    ...draft,
    setListId: (listId: string | null) => updateDraft({ listId }),
    setUnsubscribeTopicId: (unsubscribeTopicId: string | null) =>
      updateDraft({ unsubscribeTopicId }),
    setFromAddress: (fromAddress: string) => updateDraft({ fromAddress }),
    setSubject: (subject: string) => updateDraft({ subject }),
    setBody: (body: string) => updateDraft({ body }),
    handleSend,
    canSend,
    loading,
  };
};
