import { GMAIL_SEND_SCOPE } from '@/accounts/constants/GmailSendScope';
import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { WorkflowSendEmailAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { IconMail, IconPlus, isDefined } from 'twenty-ui';
import { JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';

type WorkflowEditActionFormSendEmailProps = {
  action: WorkflowSendEmailAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowSendEmailAction) => void;
      };
};

type SendEmailFormData = {
  connectedAccountId: string;
  email: string;
  subject: string;
  body: string;
};

export const WorkflowEditActionFormSendEmail = ({
  action,
  actionOptions,
}: WorkflowEditActionFormSendEmailProps) => {
  const theme = useTheme();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { triggerApisOAuth } = useTriggerApisOAuth();

  const workflowId = useRecoilValue(workflowIdState);
  const redirectUrl = `/object/workflow/${workflowId}`;

  const [formData, setFormData] = useState<SendEmailFormData>({
    connectedAccountId: action.settings.input.connectedAccountId,
    email: action.settings.input.email,
    subject: action.settings.input.subject ?? '',
    body: action.settings.input.body ?? '',
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
      await triggerApisOAuth('google', {
        redirectLocation: redirectUrl,
        loginHint: connectedAccount.handle,
      });
    }
  };

  const saveAction = useDebouncedCallback(
    async (formData: SendEmailFormData, checkScopes = false) => {
      if (actionOptions.readonly === true) {
        return;
      }

      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
            connectedAccountId: formData.connectedAccountId,
            email: formData.email,
            subject: formData.subject,
            body: formData.body,
          },
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

  const handleFieldChange = (
    fieldName: keyof SendEmailFormData,
    updatedValue: JsonValue,
  ) => {
    const newFormData: SendEmailFormData = {
      ...formData,
      [fieldName]: updatedValue,
    };

    setFormData(newFormData);

    saveAction(newFormData);
  };

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
    isDefined(action.settings.input.connectedAccountId) &&
    action.settings.input.connectedAccountId !== ''
  ) {
    filter.or.push({
      id: {
        eq: action.settings.input.connectedAccountId,
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

  const headerTitle = isDefined(action.name) ? action.name : 'Send Email';

  return (
    !loading && (
      <>
        <WorkflowStepHeader
          onTitleChange={(newName: string) => {
            if (actionOptions.readonly === true) {
              return;
            }

            actionOptions.onActionUpdate({
              ...action,
              name: newName,
            });
          }}
          Icon={IconMail}
          iconColor={theme.color.blue}
          initialTitle={headerTitle}
          headerType="Email"
        />
        <WorkflowStepBody>
          <Select
            dropdownId="select-connected-account-id"
            label="Account"
            fullWidth
            emptyOption={emptyOption}
            value={formData.connectedAccountId}
            options={connectedAccountOptions}
            callToActionButton={{
              onClick: () =>
                triggerApisOAuth('google', {
                  redirectLocation: redirectUrl,
                }),
              Icon: IconPlus,
              text: 'Add account',
            }}
            onChange={(connectedAccountId) => {
              handleFieldChange('connectedAccountId', connectedAccountId);
            }}
            disabled={actionOptions.readonly}
          />
          <FormTextFieldInput
            label="Email"
            placeholder="Enter receiver email"
            readonly={actionOptions.readonly}
            defaultValue={formData.email}
            onPersist={(email) => {
              handleFieldChange('email', email);
            }}
            VariablePicker={WorkflowVariablePicker}
          />
          <FormTextFieldInput
            label="Subject"
            placeholder="Enter email subject"
            readonly={actionOptions.readonly}
            defaultValue={formData.subject}
            onPersist={(subject) => {
              handleFieldChange('subject', subject);
            }}
            VariablePicker={WorkflowVariablePicker}
          />
          <FormTextFieldInput
            label="Body"
            placeholder="Enter email body"
            readonly={actionOptions.readonly}
            defaultValue={formData.body}
            onPersist={(body) => {
              handleFieldChange('body', body);
            }}
            VariablePicker={WorkflowVariablePicker}
            multiline
          />
        </WorkflowStepBody>
      </>
    )
  );
};
