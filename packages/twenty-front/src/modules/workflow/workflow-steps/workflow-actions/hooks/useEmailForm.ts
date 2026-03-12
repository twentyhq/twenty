import { useState } from 'react';
import { type EmailFormData } from '@/workflow/types/EmailFormData';
import { type WorkflowEmailAction } from '@/workflow/types/WorkflowEmailAction';
import { type JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';

type UseEmailFormParams = {
  action: WorkflowEmailAction;
  onActionUpdate?: (action: WorkflowEmailAction) => void;
  readonly: boolean;
};

export const useEmailForm = ({
  action,
  onActionUpdate,
  readonly,
}: UseEmailFormParams) => {
  const actionInput = action.settings?.input;

  const [formData, setFormData] = useState<EmailFormData>(() => {
    const inputRecipients = actionInput?.recipients;

    return {
      connectedAccountId: actionInput?.connectedAccountId ?? '',
      recipients: {
        to: inputRecipients?.to ?? '',
        cc: inputRecipients?.cc ?? '',
        bcc: inputRecipients?.bcc ?? '',
      },
      subject: actionInput?.subject ?? '',
      body: actionInput?.body ?? '',
      files: actionInput?.files ?? [],
    };
  });

  const saveAction = useDebouncedCallback((formData: EmailFormData) => {
    if (readonly) {
      return;
    }

    onActionUpdate?.({
      ...action,
      settings: {
        ...action.settings,
        input: {
          connectedAccountId: formData.connectedAccountId,
          recipients: formData.recipients,
          subject: formData.subject,
          body: formData.body,
          files: formData.files,
        },
      },
    });
  }, 1_000);

  const handleFieldChange = (
    fieldName: keyof EmailFormData,
    updatedValue: JsonValue,
  ) => {
    const newFormData: EmailFormData = {
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
