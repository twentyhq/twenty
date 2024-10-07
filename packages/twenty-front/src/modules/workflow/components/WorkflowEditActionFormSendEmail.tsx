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
import { Select } from '@/ui/input/components/Select';
import { useFindManyRecords } from 'packages/twenty-front/src/modules/object-record/hooks/useFindManyRecords';
import { ConnectedAccount } from 'packages/twenty-front/src/modules/accounts/types/ConnectedAccount';
import { useRecoilValue } from 'recoil';
import { currentWorkspaceMemberState } from 'packages/twenty-front/src/modules/auth/states/currentWorkspaceMemberState';

const StyledTriggerSettings = styled.div`
  padding: ${({ theme }) => theme.spacing(6)};
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme }) => theme.spacing(4)};
`;

type SendEmailFormData = {
  connectedAccountId: string;
  subject: string;
  body: string;
};

export const WorkflowEditActionFormSendEmail = ({
  action,
  onActionUpdate,
}: {
  action: WorkflowSendEmailStep;
  onActionUpdate: (action: WorkflowSendEmailStep) => void;
}) => {
  const theme = useTheme();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const form = useForm<SendEmailFormData>({
    defaultValues: {
      connectedAccountId: '',
      subject: '',
      body: '',
    },
  });

  useEffect(() => {
    form.setValue(
      'connectedAccountId',
      action.settings.connectedAccountId ?? '',
    );
    form.setValue('subject', action.settings.subject ?? '');
    form.setValue('body', action.settings.body ?? '');
  }, [
    action.settings.connectedAccountId,
    action.settings.subject,
    action.settings.body,
    form,
  ]);

  const saveAction = useDebouncedCallback((formData: SendEmailFormData) => {
    onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        connectedAccountId: formData.connectedAccountId,
        subject: formData.subject,
        body: formData.body,
      },
    });
  }, 1_000);

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  const handleSave = form.handleSubmit(saveAction);

  const { records: accounts, loading } = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: 'connectedAccount',
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
    },
  });

  const emptyOption = { label: 'None', value: null };

  const connectedAccountOptions = accounts.map((account) => {
    return {
      label: account.handle,
      value: account.id,
    };
  });

  return (
    !loading && (
      <WorkflowEditActionFormBase
        ActionIcon={<IconMail color={theme.color.blue} />}
        actionTitle="Send Email"
        actionType="Email"
      >
        <StyledTriggerSettings>
          <Controller
            name="connectedAccountId"
            control={form.control}
            render={({ field }) => (
              <Select
                dropdownId="select-connected-account-id"
                label="Account"
                fullWidth
                emptyOption={emptyOption}
                value={field.value}
                options={connectedAccountOptions}
                onChange={(connectedAccountId) => {
                  field.onChange(connectedAccountId);

                  handleSave();
                }}
              />
            )}
          />
          <Controller
            name="subject"
            control={form.control}
            render={({ field }) => (
              <TextInput
                label="Subject"
                placeholder="Use payload variables with {{variable}}"
                value={field.value}
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
                placeholder="Use payload variables with {{variable}}"
                value={field.value}
                minRows={4}
                onChange={(email) => {
                  field.onChange(email);

                  handleSave();
                }}
              />
            )}
          />
        </StyledTriggerSettings>
      </WorkflowEditActionFormBase>
    )
  );
};
