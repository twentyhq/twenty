import { CREATE_CALENDAR_EVENT } from '@/activities/calendar/graphql/mutations/createCalendarEvent';
import { useRefetchTimelineCalendarEvents } from '@/activities/calendar/hooks/useRefetchTimelineCalendarEvents';
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
  const { refetchTimelineCalendarEvents } = useRefetchTimelineCalendarEvents();
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

          return { success: false };
        }

        enqueueSuccessSnackBar({
          message: t`Calendar event created successfully`,
        });

        await refetchTimelineCalendarEvents();

        return {
          success: true,
          calendarEventId:
            result.data.createCalendarEvent.calendarEventId ?? undefined,
        };
      } catch {
        enqueueErrorSnackBar({
          message: t`Failed to create calendar event`,
        });

        return { success: false };
      }
    },
    [
      refetchTimelineCalendarEvents,
      createCalendarEventMutation,
      enqueueErrorSnackBar,
      enqueueSuccessSnackBar,
    ],
  );

  return { createCalendarEvent, loading };
};
