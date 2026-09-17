import { useMutation } from '@apollo/client/react';

import { SET_PERSON_EMAIL_TRACKING_CONSENT } from '@/activities/emails/graphql/mutations/setPersonEmailTrackingConsent';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { t } from '@lingui/core/macro';
import { useToast } from 'twenty-ui/primitives/feedback';
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

  const { enqueueToast } = useToast();
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
        enqueueToast({
          variant: 'error',
          children: t`Could not update the email tracking preference`,
        });

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

      enqueueToast({
        variant: 'success',
        children:
          decision === MessageTrackingConsentDecision.DENIED
            ? t`Opted out of email tracking`
            : t`Opted in to email tracking`,
      });

      return true;
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));

      return false;
    }
  };

  return { setPersonEmailTrackingConsent, loading };
};
