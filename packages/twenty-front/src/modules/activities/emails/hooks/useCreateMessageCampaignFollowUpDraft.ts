import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CREATE_MESSAGE_CAMPAIGN_FOLLOW_UP_DRAFT } from '@/activities/emails/graphql/mutations/createMessageCampaignFollowUpDraft';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  type CampaignEngagementActivityFilter,
  type CreateMessageCampaignFollowUpDraftMutation,
  type CreateMessageCampaignFollowUpDraftMutationVariables,
} from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useCreateMessageCampaignFollowUpDraft = () => {
  const navigateApp = useNavigateApp();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const [mutate, { loading }] = useMutation<
    CreateMessageCampaignFollowUpDraftMutation,
    CreateMessageCampaignFollowUpDraftMutationVariables
  >(CREATE_MESSAGE_CAMPAIGN_FOLLOW_UP_DRAFT);

  const createFollowUpDraft = async ({
    messageCampaignId,
    activityFilter,
  }: {
    messageCampaignId: string;
    activityFilter: CampaignEngagementActivityFilter;
  }) => {
    try {
      const result = await mutate({
        variables: { input: { messageCampaignId, activityFilter } },
      });
      const draft = result.data?.createMessageCampaignFollowUpDraft;

      if (!isDefined(draft)) {
        return;
      }

      if (draft.skippedCount > 0) {
        enqueueSuccessSnackBar({
          message: t`${draft.memberCount} contacts added, ${draft.skippedCount} skipped because they are deleted or not accessible.`,
        });
      }

      navigateApp(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.MessageCampaign,
        objectRecordId: draft.messageCampaignId,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        ...(CombinedGraphQLErrors.is(error)
          ? { apolloError: error }
          : { message: t`Failed to create the follow-up draft.` }),
      });
    }
  };

  return { createFollowUpDraft, isCreating: loading };
};
