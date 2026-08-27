import { CREATE_CALENDAR_EVENT } from '@/activities/calendar/graphql/mutations/createCalendarEvent';
import { getTimelineCalendarEventsFromObjectRecord } from '@/activities/calendar/graphql/queries/getTimelineCalendarEventsFromObjectRecord';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import {
  type CreateCalendarEventInput,
  type CreateCalendarEventOutput,
  type MutationCreateCalendarEventArgs,
} from '~/generated-metadata/graphql';

export const useCreateCalendarEvent = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const [createCalendarEventMutation, { loading }] = useMutation<
    { createCalendarEvent: CreateCalendarEventOutput },
    MutationCreateCalendarEventArgs
  >(CREATE_CALENDAR_EVENT);

  const createCalendarEvent = useCallback(
    async (input: CreateCalendarEventInput) => {
      try {
        const result = await createCalendarEventMutation({
          variables: { input },
        });

        if (!result.data?.createCalendarEvent.success) {
          enqueueErrorSnackBar({
            message:
              result.data?.createCalendarEvent.error ??
              t`Failed to create calendar event`,
          });

          return false;
        }

        enqueueSuccessSnackBar({
          message: t`Calendar event created successfully`,
        });

        await apolloCoreClient.refetchQueries({
          include: [getTimelineCalendarEventsFromObjectRecord],
        });

        return true;
      } catch {
        enqueueErrorSnackBar({
          message: t`Failed to create calendar event`,
        });

        return false;
      }
    },
    [
      apolloCoreClient,
      createCalendarEventMutation,
      enqueueErrorSnackBar,
      enqueueSuccessSnackBar,
    ],
  );

  return { createCalendarEvent, loading };
};
