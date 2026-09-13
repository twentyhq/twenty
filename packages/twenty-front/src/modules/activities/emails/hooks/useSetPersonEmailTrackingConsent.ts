import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';

import { SET_PERSON_EMAIL_TRACKING_CONSENT } from '@/activities/emails/graphql/mutations/setPersonEmailTrackingConsent';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import {
  MessageTrackingConsentDecision,
  type SetPersonEmailTrackingConsentMutation,
  type SetPersonEmailTrackingConsentMutationVariables,
} from '~/generated-metadata/graphql';

export const useSetPersonEmailTrackingConsent = () => {
  const [setPersonEmailTrackingConsentMutation, { loading }] = useMutation<
    SetPersonEmailTrackingConsentMutation,
    SetPersonEmailTrackingConsentMutationVariables
  >(SET_PERSON_EMAIL_TRACKING_CONSENT);

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const setPersonEmailTrackingConsent = async ({
    personId,
    decision,
  }: {
    personId: string;
    decision: MessageTrackingConsentDecision;
  }): Promise<boolean> => {
    try {
      const result = await setPersonEmailTrackingConsentMutation({
        variables: { input: { personId, decision } },
      });

      if (result.data?.setPersonEmailTrackingConsent !== true) {
        enqueueErrorSnackBar({ message: t`Failed to update email tracking` });

        return false;
      }

      upsertRecordsInStore({
        partialRecords: [
          {
            __typename: 'Person',
            id: personId,
            emailTrackingConsent: decision,
          },
        ],
      });

      enqueueSuccessSnackBar({
        message:
          decision === MessageTrackingConsentDecision.DENIED
            ? t`Opens and clicks are no longer measured for this person`
            : t`Opens and clicks are measured again for this person`,
      });

      return true;
    } catch (error) {
      enqueueErrorSnackBar({
        ...(CombinedGraphQLErrors.is(error) ? { apolloError: error } : {}),
      });

      return false;
    }
  };

  return { setPersonEmailTrackingConsent, loading };
};
