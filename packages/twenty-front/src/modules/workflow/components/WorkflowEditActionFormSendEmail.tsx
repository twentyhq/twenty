import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { WorkflowEditActionFormBase } from '@/workflow/components/WorkflowEditActionFormBase';
import { WorkflowSendEmailStep } from '@/workflow/types/Workflow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { IconMail } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';

const StyledTriggerSettings = styled.div`
  padding: ${({ theme }) => theme.spacing(6)};
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme }) => theme.spacing(4)};
`;

type WorkflowEditActionFormSendEmailProps =
  | {
      action: WorkflowSendEmailStep;
      readonly: true;
    }
  | {
      action: WorkflowSendEmailStep;
      readonly?: false;
      onActionUpdate: (action: WorkflowSendEmailStep) => void;
    };

type SendEmailFormData = {
  subject: string;
  body: string;
};

export const WorkflowEditActionFormSendEmail = (
  props: WorkflowEditActionFormSendEmailProps,
) => {
  const theme = useTheme();

  const form = useForm<SendEmailFormData>({
    defaultValues: {
      subject: '',
      body: '',
    },
    disabled: props.readonly,
  });

  useEffect(() => {
    form.setValue('subject', props.action.settings.subject ?? '');
    form.setValue('body', props.action.settings.template ?? '');
  }, [props.action.settings.subject, props.action.settings.template, form]);

  const saveAction = useDebouncedCallback((formData: SendEmailFormData) => {
    if (props.readonly === true) {
      return;
    }

    props.onActionUpdate({
      ...props.action,
      settings: {
        ...props.action.settings,
        title: formData.subject,
        subject: formData.subject,
        template: formData.body,
      },
    });
  }, 1_000);

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  const handleSave = form.handleSubmit(saveAction);

  return (
    <WorkflowEditActionFormBase
      ActionIcon={<IconMail color={theme.color.blue} />}
      actionTitle="Send Email"
      actionType="Email"
    >
      <StyledTriggerSettings>
        <Controller
          name="subject"
          control={form.control}
          render={({ field }) => (
            <TextInput
              label="Subject"
              placeholder="Thank you for building such an awesome CRM!"
              value={field.value}
              disabled={field.disabled}
              onChange={(email) => {
                field.onChange(email);

                handleSave();
              }}
            />
          )}
        />

        <Controller
          name="body"
          control={form.control}
          render={({ field }) => (
            <TextArea
              label="Body"
              placeholder="Thank you so much!"
              value={field.value}
              minRows={4}
              disabled={field.disabled}
              onChange={(email) => {
                field.onChange(email);

                handleSave();
              }}
            />
          )}
        />
      </StyledTriggerSettings>
    </WorkflowEditActionFormBase>
  );
};
