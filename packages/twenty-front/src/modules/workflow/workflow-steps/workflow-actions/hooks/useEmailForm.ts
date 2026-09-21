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
  const [formData, setFormData] = useState<EmailFormData>(() => {
    const inputRecipients = action.settings.input.recipients;

    return {
      connectedAccountId: action.settings.input.connectedAccountId,
      fromHandle: action.settings.input.fromHandle ?? '',
      recipients: {
        to: inputRecipients?.to ?? '',
        cc: inputRecipients?.cc ?? '',
        bcc: inputRecipients?.bcc ?? '',
      },
      subject: action.settings.input.subject ?? '',
      body: action.settings.input.body ?? '',
      files: action.settings.input.files ?? [],
      inReplyTo: action.settings.input.inReplyTo ?? '',
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
          fromHandle: formData.fromHandle,
          recipients: formData.recipients,
          subject: formData.subject,
          body: formData.body,
          files: formData.files,
          inReplyTo: formData.inReplyTo,
        },
      },
    });
  }, 1_000);

  const applyFormData = (newFormData: EmailFormData) => {
    setFormData(newFormData);
    saveAction(newFormData);
  };

  const handleFieldsChange = (updatedFields: Partial<EmailFormData>) => {
    applyFormData({ ...formData, ...updatedFields });
  };

  const handleFieldChange = (
    fieldName: keyof EmailFormData,
    updatedValue: JsonValue,
  ) => {
    applyFormData({ ...formData, [fieldName]: updatedValue });
  };

  return {
    formData,
    handleFieldChange,
    handleFieldsChange,
    saveAction,
  };
};
