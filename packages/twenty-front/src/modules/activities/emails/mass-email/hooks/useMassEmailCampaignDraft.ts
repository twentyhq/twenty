import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

import { SAVE_MASS_EMAIL_CAMPAIGN_DRAFT } from '@/activities/emails/mass-email/graphql/massEmailCampaign';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';

type SaveMassEmailCampaignDraftInput = {
  campaignId?: string;
  connectedAccountId: string;
  personIds: string[];
  subject?: string;
  body?: string;
};

export const useMassEmailCampaignDraft = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [saveMutation, { loading: isSaving }] = useMutation<
    { saveMassEmailCampaignDraft: { campaignId: string; updatedAt: string } },
    { input: SaveMassEmailCampaignDraftInput }
  >(SAVE_MASS_EMAIL_CAMPAIGN_DRAFT);

  const saveDraft = useCallback(
    async (input: SaveMassEmailCampaignDraftInput) => {
      try {
        const result = await saveMutation({
          variables: { input },
        });

        return result.data?.saveMassEmailCampaignDraft ?? null;
      } catch (error) {
        enqueueErrorSnackBar({
          message:
            error instanceof Error ? error.message : t`Failed to save draft`,
        });

        return null;
      }
    },
    [enqueueErrorSnackBar, saveMutation],
  );

  return { saveDraft, isSaving };
};
