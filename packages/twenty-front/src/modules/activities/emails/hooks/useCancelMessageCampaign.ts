import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';

import { CANCEL_MESSAGE_CAMPAIGN } from '@/activities/emails/graphql/mutations/cancelMessageCampaign';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import {
  type CancelMessageCampaignMutation,
  type CancelMessageCampaignMutationVariables,
} from '~/generated-metadata/graphql';

export const useCancelMessageCampaign = () => {
  const [cancelMessageCampaignMutation, { loading }] = useMutation<
    CancelMessageCampaignMutation,
    CancelMessageCampaignMutationVariables
  >(CANCEL_MESSAGE_CAMPAIGN);

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const cancelMessageCampaign = async ({
    campaignId,
  }: {
    campaignId: string;
  }): Promise<boolean> => {
    try {
      const result = await cancelMessageCampaignMutation({
        variables: { input: { campaignId } },
      });

      const canceled = result.data?.cancelMessageCampaign;

      if (!canceled) {
        enqueueErrorSnackBar({ message: t`Failed to cancel campaign` });

        return false;
      }

      enqueueSuccessSnackBar({
        message: t`Campaign canceled, ${canceled.canceledMessageCount} pending email(s) stopped`,
      });

      return true;
    } catch (error) {
      enqueueErrorSnackBar({
        ...(CombinedGraphQLErrors.is(error) ? { apolloError: error } : {}),
      });

      return false;
    }
  };

  return { cancelMessageCampaign, loading };
};
