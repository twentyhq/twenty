import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

import { SEND_EMAIL } from '@/activities/emails/graphql/mutations/sendEmail';
import { getTimelineThreadsFromCompanyId } from '@/activities/emails/graphql/queries/getTimelineThreadsFromCompanyId';
import { getTimelineThreadsFromOpportunityId } from '@/activities/emails/graphql/queries/getTimelineThreadsFromOpportunityId';
import { getTimelineThreadsFromPersonId } from '@/activities/emails/graphql/queries/getTimelineThreadsFromPersonId';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import {
  type SendEmailMutation,
  type SendEmailMutationVariables,
} from '~/generated-metadata/graphql';

type SendEmailParams = {
  connectedAccountId: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  inReplyTo?: string;
};

export const useSendEmail = () => {
  const apolloCoreClient = useApolloCoreClient();

  const [sendEmailMutation, { loading }] = useMutation<
    SendEmailMutation,
    SendEmailMutationVariables
  >(SEND_EMAIL);

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const sendEmail = useCallback(
    async (params: SendEmailParams): Promise<boolean> => {
      try {
        const result = await sendEmailMutation({
          variables: {
            input: {
              connectedAccountId: params.connectedAccountId,
              to: params.to,
              cc: params.cc,
              bcc: params.bcc,
              subject: params.subject,
              body: params.body,
              inReplyTo: params.inReplyTo,
            },
          },
        });

        if (result.data?.sendEmail.success) {
          enqueueSuccessSnackBar({
            message: t`Email sent successfully`,
          });

          await apolloCoreClient.refetchQueries({
            include: [
              getTimelineThreadsFromCompanyId,
              getTimelineThreadsFromPersonId,
              getTimelineThreadsFromOpportunityId,
              'FindManyMessages',
              'FindManyMessageParticipants',
              'FindManyMessageChannelMessageAssociations',
            ],
          });

          return true;
        }

        enqueueErrorSnackBar({
          message: result.data?.sendEmail.error ?? t`Failed to send email`,
        });

        return false;
      } catch {
        enqueueErrorSnackBar({
          message: t`Failed to send email`,
        });

        return false;
      }
    },
    [
      sendEmailMutation,
      enqueueSuccessSnackBar,
      enqueueErrorSnackBar,
      apolloCoreClient,
    ],
  );

  return { sendEmail, loading };
};
