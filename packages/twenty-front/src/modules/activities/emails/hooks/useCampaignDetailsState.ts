import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useDebouncedCallback } from 'use-debounce';

import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

type CampaignDetailsDraft = {
  listId: string | null;
  unsubscribeTopicId: string | null;
  fromAddress: string;
  subject: string;
};

export const useCampaignDetailsState = ({
  campaign,
}: {
  campaign: MessageCampaign;
}) => {
  const [draft, setDraft] = useState<CampaignDetailsDraft>(() => ({
    listId: campaign.listId,
    unsubscribeTopicId: campaign.unsubscribeTopicId,
    fromAddress: campaign.fromAddress?.primaryEmail ?? '',
    subject: campaign.subject ?? '',
  }));

  const { updateOneRecord } = useUpdateOneRecord();
  const { enqueueErrorSnackBar } = useSnackBar();

  const persistDebounced = useDebouncedCallback(
    (next: CampaignDetailsDraft) => {
      updateOneRecord({
        objectNameSingular: CoreObjectNameSingular.MessageCampaign,
        idToUpdate: campaign.id,
        updateOneRecordInput: {
          listId: next.listId,
          unsubscribeTopicId: next.unsubscribeTopicId,
          fromAddress: {
            primaryEmail: next.fromAddress.trim(),
            additionalEmails: null,
          },
          subject: next.subject,
        },
      }).catch(() =>
        enqueueErrorSnackBar({ message: t`Failed to save the campaign` }),
      );
    },
    500,
  );

  const updateDraft = (partialDraft: Partial<CampaignDetailsDraft>) => {
    const nextDraft = { ...draft, ...partialDraft };

    setDraft(nextDraft);
    persistDebounced(nextDraft);
  };

  return {
    ...draft,
    setListId: (listId: string | null) => updateDraft({ listId }),
    setUnsubscribeTopicId: (unsubscribeTopicId: string | null) =>
      updateDraft({ unsubscribeTopicId }),
    setFromAddress: (fromAddress: string) => updateDraft({ fromAddress }),
    setSubject: (subject: string) => updateDraft({ subject }),
  };
};
