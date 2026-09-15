import { type CalendarEventFormData } from '@/workflow/types/CalendarEventFormData';
import { type WorkflowCreateCalendarEventAction } from '@/workflow/types/Workflow';
import { useState } from 'react';
import { type JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';

type UseCalendarEventFormParams = {
  action: WorkflowCreateCalendarEventAction;
  onActionUpdate?: (action: WorkflowCreateCalendarEventAction) => void;
  readonly: boolean;
};

export const useCalendarEventForm = ({
  action,
  onActionUpdate,
  readonly,
}: UseCalendarEventFormParams) => {
  const [formData, setFormData] = useState<CalendarEventFormData>(() => {
    const input = action.settings.input;

    return {
      connectedAccountId: input.connectedAccountId,
      title: input.title,
      description: input.description ?? '',
      location: input.location ?? '',
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      isFullDay: input.isFullDay,
      timeZone: input.timeZone ?? '',
      attendees: input.attendees ?? '',
      sendInvitations: input.sendInvitations,
      addConferencing: input.addConferencing,
    };
  });

  const saveAction = useDebouncedCallback(
    (nextFormData: CalendarEventFormData) => {
      if (readonly) {
        return;
      }

      onActionUpdate?.({
        ...action,
        settings: {
          ...action.settings,
          input: { ...nextFormData },
        },
      });
    },
    1_000,
  );

  const handleFieldChange = (
    fieldName: keyof CalendarEventFormData,
    updatedValue: JsonValue,
  ) => {
    const newFormData: CalendarEventFormData = {
      ...formData,
      [fieldName]: updatedValue,
    };

    setFormData(newFormData);
    saveAction(newFormData);
  };

  return {
    formData,
    handleFieldChange,
    saveAction,
  };
};
