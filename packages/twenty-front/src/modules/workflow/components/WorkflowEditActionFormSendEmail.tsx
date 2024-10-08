import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { WorkflowEditActionFormBase } from '@/workflow/components/WorkflowEditActionFormBase';
import { WorkflowSendEmailStep } from '@/workflow/types/Workflow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { IconMail, IconPlus, isDefined } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { useRecoilValue } from 'recoil';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useTriggerGoogleApisOAuth } from '@/settings/accounts/hooks/useTriggerGoogleApisOAuth';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { GMAIL_SEND_SCOPE } from '@/accounts/constants/GmailSendScope';

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
  connectedAccountId: string;
  subject: string;
  body: string;
};

export const WorkflowEditActionFormSendEmail = (
  props: WorkflowEditActionFormSendEmailProps,
) => {
  const theme = useTheme();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { triggerGoogleApisOAuth } = useTriggerGoogleApisOAuth();
  const workflowId = useRecoilValue(workflowIdState);
  const redirectUrl = `/object/workflow/${workflowId}`;

  const form = useForm<SendEmailFormData>({
    defaultValues: {
      connectedAccountId: '',
      subject: '',
      body: '',
    },
    disabled: props.readonly,
  });

  const checkConnectedAccountScopes = async (
    connectedAccountId: string | null,
  ) => {
    const connectedAccount = accounts.find(
      (account) => account.id === connectedAccountId,
    );
    if (!isDefined(connectedAccount)) {
      return;
    }
    const scopes = connectedAccount.scopes;
    if (
      !isDefined(scopes) ||
      !isDefined(scopes.find((scope) => scope === GMAIL_SEND_SCOPE))
    ) {
      await triggerGoogleApisOAuth({
        redirectLocation: redirectUrl,
        loginHint: connectedAccount.handle,
      });
    }
  };

  useEffect(() => {
    form.setValue(
      'connectedAccountId',
      props.action.settings.connectedAccountId ?? '',
    );
    form.setValue('subject', props.action.settings.subject ?? '');
    form.setValue('body', props.action.settings.body ?? '');
  }, [props.action.settings, form]);

  const saveAction = useDebouncedCallback(
    async (formData: SendEmailFormData, checkScopes = false) => {
      if (props.readonly === true) {
        return;
      }
      props.onActionUpdate({
        ...props.action,
        settings: {
          ...props.action.settings,
          connectedAccountId: formData.connectedAccountId,
          subject: formData.subject,
          body: formData.body,
        },
      });
      if (checkScopes === true) {
        await checkConnectedAccountScopes(formData.connectedAccountId);
      }
    },
    1_000,
  );

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  const handleSave = (checkScopes = false) =>
    form.handleSubmit((formData: SendEmailFormData) =>
      saveAction(formData, checkScopes),
    )();

  const filter: { or: object[] } = {
    or: [
      {
        accountOwnerId: {
          eq: currentWorkspaceMember?.id,
        },
      },
    ],
  };

  if (
    isDefined(props.action.settings.connectedAccountId) &&
    props.action.settings.connectedAccountId !== ''
  ) {
    filter.or.push({
      id: {
        eq: props.action.settings.connectedAccountId,
      },
    });
  }

  const { records: accounts, loading } = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: 'connectedAccount',
    filter,
  });

  let emptyOption: SelectOption<string | null> = { label: 'None', value: null };
  const connectedAccountOptions: SelectOption<string | null>[] = [];

  accounts.forEach((account) => {
    const selectOption = {
      label: account.handle,
      value: account.id,
    };
    if (account.accountOwnerId === currentWorkspaceMember?.id) {
      connectedAccountOptions.push(selectOption);
    } else {
      // This handle the case when the current connected account does not belong to the currentWorkspaceMember
      // In that case, current connected account email is displayed, but cannot be selected
      emptyOption = selectOption;
    }
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
                callToActionButton={{
                  onClick: () =>
                    triggerGoogleApisOAuth({ redirectLocation: redirectUrl }),
                  Icon: IconPlus,
                  text: 'Add account',
                }}
                onChange={(connectedAccountId) => {
                  field.onChange(connectedAccountId);
                  handleSave(true);
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
                placeholder="Enter email subject (use {{variable}} for dynamic content)"
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
                placeholder="Enter email body (use {{variable}} for dynamic content)"
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
