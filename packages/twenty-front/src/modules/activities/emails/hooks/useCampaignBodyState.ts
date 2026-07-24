import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useDebouncedCallback } from 'use-debounce';

import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useCampaignBodyState = ({
  campaign,
}: {
  campaign: MessageCampaign;
}) => {
  const [body, setBody] = useState(() => campaign.bodyTemplate ?? '');

  const { updateOneRecord } = useUpdateOneRecord();
  const { enqueueErrorSnackBar } = useSnackBar();

  const persistDebounced = useDebouncedCallback((nextBody: string) => {
    updateOneRecord({
      objectNameSingular: CoreObjectNameSingular.MessageCampaign,
      idToUpdate: campaign.id,
      updateOneRecordInput: { bodyTemplate: nextBody },
    }).catch(() =>
      enqueueErrorSnackBar({ message: t`Failed to save the campaign` }),
    );
  }, 500);

  const updateBody = (nextBody: string) => {
    setBody(nextBody);
    persistDebounced(nextBody);
  };

  return { body, setBody: updateBody };
};
