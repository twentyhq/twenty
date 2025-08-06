import { GMAIL_SEND_SCOPE } from '@/accounts/constants/GmailSendScope';
import { MICROSOFT_SEND_SCOPE } from '@/accounts/constants/MicrosoftSendScope';
import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { SettingsPath } from '@/types/SettingsPath';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WorkflowSendEmailAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { IconPlus, useIcons } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
import { JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type WorkflowEditActionSendEmailProps = {
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

export const WorkflowEditActionSendEmail = ({
  action,
  actionOptions,
}: WorkflowEditActionSendEmailProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { triggerApisOAuth } = useTriggerApisOAuth();

  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const redirectUrl = `/object/workflow/${workflowVisualizerWorkflowId}`;

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

    const hasSendScope = (
      connectedAccount: ConnectedAccount,
      scopes: string[],
    ): boolean => {
      switch (connectedAccount.provider) {
        case ConnectedAccountProvider.GOOGLE:
          return scopes.some((scope) => scope === GMAIL_SEND_SCOPE);
        case ConnectedAccountProvider.MICROSOFT:
          return scopes.some((scope) => scope === MICROSOFT_SEND_SCOPE);
        case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
          return isDefined(connectedAccount.connectionParameters?.SMTP);
        default:
          assertUnreachable(
            connectedAccount.provider,
            'Provider not yet supported for sending emails',
          );
      }
    };

    if (
      connectedAccount.provider !== ConnectedAccountProvider.IMAP_SMTP_CALDAV &&
      (!isDefined(scopes) || !hasSendScope(connectedAccount, scopes))
    ) {
      await triggerApisOAuth(connectedAccount.provider, {
        redirectLocation: redirectUrl,
        loginHint: connectedAccount.handle,
      });
    }
  };

  const saveAction = useDebouncedCallback(
    async (formData: SendEmailFormData) => {
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

      await checkConnectedAccountScopes(formData.connectedAccountId);
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
    recordGqlFields: {
      id: true,
      handle: true,
      provider: true,
      scopes: true,
      accountOwnerId: true,
      connectionParameters: true,
    },
  });

  let emptyOption: SelectOption<string | null> = { label: 'None', value: null };
  const connectedAccountOptions: SelectOption<string | null>[] = [];

  accounts.forEach((account) => {
    if (
      account.provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV &&
      !isDefined(account.connectionParameters?.SMTP)
    ) {
      return;
    }

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

  const { headerTitle, headerIcon, headerIconColor, headerType } =
    useWorkflowActionHeader({
      action,
      defaultTitle: 'Send Email',
    });

  const navigate = useNavigateSettings();

  const { closeCommandMenu } = useCommandMenu();
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
          Icon={getIcon(headerIcon)}
          iconColor={headerIconColor}
          initialTitle={headerTitle}
          headerType={headerType}
          disabled={actionOptions.readonly}
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
              onClick: () => {
                closeCommandMenu();
                navigate(SettingsPath.NewAccount);
              },
              Icon: IconPlus,
              text: 'Add account',
            }}
            onChange={(connectedAccountId) => {
              handleFieldChange('connectedAccountId', connectedAccountId);
            }}
            disabled={actionOptions.readonly}
            dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
            dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
          />
          <FormTextFieldInput
            label="Email"
            placeholder="Enter receiver email"
            readonly={actionOptions.readonly}
            defaultValue={formData.email}
            onChange={(email) => {
              handleFieldChange('email', email);
            }}
            VariablePicker={WorkflowVariablePicker}
          />
          <FormTextFieldInput
            label="Subject"
            placeholder="Enter email subject"
            readonly={actionOptions.readonly}
            defaultValue={formData.subject}
            onChange={(subject) => {
              handleFieldChange('subject', subject);
            }}
            VariablePicker={WorkflowVariablePicker}
          />
          <FormTextFieldInput
            label="Body"
            placeholder="Enter email body"
            readonly={actionOptions.readonly}
            defaultValue={formData.body}
            onChange={(body) => {
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
