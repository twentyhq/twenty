import { CREATE_CALENDAR_EVENT } from '@/activities/calendar/graphql/mutations/createCalendarEvent';
import { useRefetchTimelineCalendarEvents } from '@/activities/calendar/hooks/useRefetchTimelineCalendarEvents';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { useToast } from 'twenty-ui/feedback';
import {
  type CreateCalendarEventInput,
  type CreateCalendarEventOutput,
  type MutationCreateCalendarEventArgs,
} from '~/generated-metadata/graphql';

export const useCreateCalendarEvent = () => {
  const { refetchTimelineCalendarEvents } = useRefetchTimelineCalendarEvents();
  const { add: addToast } = useToast();

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
          addToast({
            variant: 'error',
            children:
              result.data?.createCalendarEvent.error ??
              t`Failed to create calendar event`,
          });

          return { success: false };
        }

        addToast({
          variant: 'success',
          children: t`Calendar event created successfully`,
        });

        await refetchTimelineCalendarEvents();

        return {
          success: true,
          calendarEventId:
            result.data.createCalendarEvent.calendarEventId ?? undefined,
        };
      } catch {
        addToast({
          variant: 'error',
          children: t`Failed to create calendar event`,
        });

        return { success: false };
      }
    },
    [refetchTimelineCalendarEvents, createCalendarEventMutation, addToast],
  );

  return { createCalendarEvent, loading };
};
