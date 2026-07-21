import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';
import { type EmailAttachment } from 'twenty-shared/types';

import { SEND_EMAIL } from '@/activities/emails/graphql/mutations/sendEmail';
import { getTimelineThreadsFromObjectRecord } from '@/activities/emails/graphql/queries/getTimelineThreadsFromObjectRecord';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import {
  type SendEmailMutation,
  type SendEmailMutationVariables,
} from '~/generated-metadata/graphql';

type SendEmailResult = {
  success: boolean;
  messageThreadId: string | null;
};

type SendEmailParams = {
  connectedAccountId: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  inReplyTo?: string;
  draftMessageId?: string;
  files?: EmailAttachment[];
};

export const useSendEmail = () => {
  const apolloCoreClient = useApolloCoreClient();

  const [sendEmailMutation, { loading }] = useMutation<
    SendEmailMutation,
    SendEmailMutationVariables
  >(SEND_EMAIL);

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const sendEmail = useCallback(
    async (params: SendEmailParams): Promise<SendEmailResult> => {
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
              draftMessageId: params.draftMessageId,
              files: params.files,
            },
          },
        });

        if (result.data?.sendEmail.success) {
          enqueueSuccessSnackBar({
            message: t`Email sent successfully`,
          });

          await apolloCoreClient.refetchQueries({
            include: [
              getTimelineThreadsFromObjectRecord,
              'FindManyMessages',
              'FindManyMessageParticipants',
              'FindManyMessageChannelMessageAssociations',
            ],
          });

          return {
            success: true,
            messageThreadId: result.data.sendEmail.messageThreadId ?? null,
          };
        }

        enqueueErrorSnackBar({
          message: result.data?.sendEmail.error ?? t`Failed to send email`,
        });

        return { success: false, messageThreadId: null };
      } catch {
        enqueueErrorSnackBar({
          message: t`Failed to send email`,
        });

        return { success: false, messageThreadId: null };
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
