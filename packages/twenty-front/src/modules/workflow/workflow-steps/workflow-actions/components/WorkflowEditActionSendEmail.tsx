import { GMAIL_SEND_SCOPE } from '@/accounts/constants/GmailSendScope';
import { MICROSOFT_SEND_SCOPE } from '@/accounts/constants/MicrosoftSendScope';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { WorkflowSendEmailAttachments } from '@/advanced-text-editor/components/WorkflowSendEmailAttachments';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { type WorkflowSendEmailAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ConnectedAccountProvider, SettingsPath } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { type JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const EMAIL_EDITOR_MIN_HEIGHT = 340;

const EMAIL_EDITOR_MAX_WIDTH = 600;

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

type WorkflowFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
};

type SendEmailFormData = {
  connectedAccountId: string;
  email: string;
  subject: string;
  body: string;
  files: WorkflowFile[];
};

export const WorkflowEditActionSendEmail = ({
  action,
  actionOptions,
}: WorkflowEditActionSendEmailProps) => {
  const theme = useTheme();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { uploadAttachmentFile } = useUploadAttachmentFile();

  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);

  const redirectUrl = `/object/workflow/${workflowVisualizerWorkflowId}`;

  const [formData, setFormData] = useState<SendEmailFormData>({
    connectedAccountId: action.settings.input.connectedAccountId,
    email: action.settings.input.email,
    subject: action.settings.input.subject ?? '',
    body: action.settings.input.body ?? '',
    files: action.settings.input.files ?? [],
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
            files: formData.files,
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

  const handleUploadAttachment = async (file: File) => {
    if (!isDefined(workflowVisualizerWorkflowId)) {
      return undefined;
    }

    const { attachmentAbsoluteURL } = await uploadAttachmentFile(file, {
      id: workflowVisualizerWorkflowId,
      targetObjectNameSingular: CoreObjectNameSingular.Workflow,
    });

    return attachmentAbsoluteURL;
  };

  const handleImageUploadError = (_: Error, file: File) => {
    enqueueErrorSnackBar({
      message: t`Failed to upload image: `.concat(file.name),
    });
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

  let emptyOption: SelectOption<string | null> = {
    label: t`None`,
    value: null,
  };
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

  const navigate = useNavigateSettings();

  const { closeCommandMenu } = useCommandMenu();

  return (
    !loading && (
      <>
        <WorkflowStepBody>
          <Select
            dropdownId="select-connected-account-id"
            label={t`Account`}
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
              text: t`Add account`,
            }}
            onChange={(connectedAccountId) => {
              handleFieldChange('connectedAccountId', connectedAccountId);
            }}
            disabled={actionOptions.readonly}
            dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
            dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
          />
          <FormTextFieldInput
            label={t`Email`}
            placeholder={t`Enter receiver email`}
            readonly={actionOptions.readonly}
            defaultValue={formData.email}
            onChange={(email) => {
              handleFieldChange('email', email);
            }}
            VariablePicker={WorkflowVariablePicker}
          />
          <FormTextFieldInput
            label={t`Subject`}
            placeholder={t`Enter email subject`}
            readonly={actionOptions.readonly}
            defaultValue={formData.subject}
            onChange={(subject) => {
              handleFieldChange('subject', subject);
            }}
            VariablePicker={WorkflowVariablePicker}
          />
          <FormAdvancedTextFieldInput
            label={t`Body`}
            readonly={actionOptions.readonly}
            defaultValue={formData.body}
            onChange={(body: string) => {
              handleFieldChange('body', body);
            }}
            VariablePicker={WorkflowVariablePicker}
            enableFullScreen={true}
            fullScreenBreadcrumbs={[
              {
                children: workflow?.name?.trim() || t`Untitled Workflow`,
                href: '#',
              },
              {
                children: isDefined(action.name) ? action.name : t`Send Email`,
                href: '#',
              },
              {
                children: t`Email Editor`,
              },
            ]}
            onImageUpload={handleUploadAttachment}
            onImageUploadError={handleImageUploadError}
            minHeight={EMAIL_EDITOR_MIN_HEIGHT}
            maxWidth={EMAIL_EDITOR_MAX_WIDTH}
          />
          <WorkflowSendEmailAttachments
            label={t`Attachments`}
            files={formData.files}
            onChange={(files) => {
              handleFieldChange('files', files);
            }}
          />
        </WorkflowStepBody>
        {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
      </>
    )
  );
};
