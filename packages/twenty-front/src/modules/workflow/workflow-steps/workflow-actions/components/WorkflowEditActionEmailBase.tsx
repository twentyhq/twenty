import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { getMissingDraftEmailScopes } from '@/accounts/utils/hasMissingDraftEmailScopes';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { WorkflowSendEmailAttachments } from '@/advanced-text-editor/components/WorkflowSendEmailAttachments';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { FormMultiTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiTextFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { type WorkflowEmailAction } from '@/workflow/workflow-steps/workflow-actions/email-action/types/WorkflowEmailAction';
import { useEmailForm } from '@/workflow/workflow-steps/workflow-actions/hooks/useEmailForm';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ConnectedAccountProvider, SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Callout, IconPlus } from 'twenty-ui/display';
import { Button, type SelectOption } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const EMAIL_EDITOR_MIN_HEIGHT = 340;

const EMAIL_EDITOR_MAX_WIDTH = 600;

type WorkflowEditActionEmailBaseProps = {
  action: WorkflowEmailAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowEmailAction) => void;
      };
};

export const WorkflowEditActionEmailBase = ({
  action,
  actionOptions,
}: WorkflowEditActionEmailBaseProps) => {
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

  const { formData, handleFieldChange, saveAction } = useEmailForm({
    action,
    onActionUpdate:
      actionOptions.readonly === true
        ? undefined
        : actionOptions.onActionUpdate,
    readonly: actionOptions.readonly === true,
  });

  const [visibleAdvancedFields, setVisibleAdvancedFields] = useState<{
    cc: boolean;
    bcc: boolean;
  }>(() => {
    const inputRecipients = action.settings.input.recipients;

    return {
      cc: Boolean(inputRecipients?.cc),
      bcc: Boolean(inputRecipients?.bcc),
    };
  });

  const { closeDropdown } = useCloseDropdown();

  const advancedOptionsDropdownId = `${action.id}-email-advanced-options`;

  const hasAvailableAdvancedOptions =
    !visibleAdvancedFields.cc || !visibleAdvancedFields.bcc;

  const handleReauthorize = async () => {
    if (!isDefined(missingScopes)) {
      return;
    }

    await triggerApisOAuth(missingScopes.provider, {
      redirectLocation: redirectUrl,
      loginHint: missingScopes.loginHint,
    });
  };

  const handleConnectedAccountChange = (connectedAccountId: string | null) => {
    handleFieldChange('connectedAccountId', connectedAccountId);
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

  const selectedAccount = accounts.find(
    (account) => account.id === formData.connectedAccountId,
  );

  const missingDraftScopes = isDefined(selectedAccount)
    ? getMissingDraftEmailScopes(selectedAccount)
    : [];

  const missingScopes =
    isDefined(selectedAccount) &&
    selectedAccount.provider !== ConnectedAccountProvider.IMAP_SMTP_CALDAV &&
    missingDraftScopes.length > 0
      ? {
          provider: selectedAccount.provider,
          loginHint: selectedAccount.handle,
        }
      : null;

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
      emptyOption = selectOption;
    }
  });

  const navigate = useNavigateSettings();

  const { closeCommandMenu } = useCommandMenu();

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

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
              handleConnectedAccountChange(connectedAccountId);
            }}
            disabled={actionOptions.readonly}
            dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
            dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
          />
          {isDefined(missingScopes) && (
            <>
              <Callout
                variant={'error'}
                title={t`Missing email draft permission.`}
                description={t`This account is connected, but we don't have permission to draft emails on your behalf yet. You'll be redirected to approve this access.`}
                action={{
                  label: t`Reauthorize`,
                  onClick: handleReauthorize,
                }}
              />
            </>
          )}
          <FormMultiTextFieldInput
            label={t`To`}
            placeholder={t`Enter emails, comma-separated`}
            readonly={actionOptions.readonly}
            defaultValue={formData.recipients.to}
            onChange={(value) => {
              handleFieldChange('recipients', {
                ...formData.recipients,
                to: value,
              });
            }}
            VariablePicker={WorkflowVariablePicker}
          />
          {visibleAdvancedFields.cc && (
            <FormMultiTextFieldInput
              label={t`CC`}
              placeholder={t`Enter CC emails, comma-separated`}
              readonly={actionOptions.readonly}
              defaultValue={formData.recipients.cc}
              onChange={(value) => {
                handleFieldChange('recipients', {
                  ...formData.recipients,
                  cc: value,
                });
              }}
              VariablePicker={WorkflowVariablePicker}
            />
          )}
          {visibleAdvancedFields.bcc && (
            <FormMultiTextFieldInput
              label={t`BCC`}
              placeholder={t`Enter BCC emails, comma-separated`}
              readonly={actionOptions.readonly}
              defaultValue={formData.recipients.bcc}
              onChange={(value) => {
                handleFieldChange('recipients', {
                  ...formData.recipients,
                  bcc: value,
                });
              }}
              VariablePicker={WorkflowVariablePicker}
            />
          )}
          {!actionOptions.readonly && hasAvailableAdvancedOptions && (
            <Dropdown
              dropdownId={advancedOptionsDropdownId}
              dropdownPlacement="bottom-start"
              clickableComponent={
                <Button
                  title={t`Advanced options`}
                  variant="secondary"
                  accent="default"
                  size="small"
                />
              }
              dropdownComponents={
                <DropdownContent
                  widthInPixels={GenericDropdownContentWidth.Medium}
                >
                  <DropdownMenuItemsContainer>
                    {!visibleAdvancedFields.cc && (
                      <MenuItem
                        text={t`Add CC`}
                        onClick={() => {
                          setVisibleAdvancedFields((prev) => ({
                            ...prev,
                            cc: true,
                          }));
                          closeDropdown(advancedOptionsDropdownId);
                        }}
                      />
                    )}
                    {!visibleAdvancedFields.bcc && (
                      <MenuItem
                        text={t`Add BCC`}
                        onClick={() => {
                          setVisibleAdvancedFields((prev) => ({
                            ...prev,
                            bcc: true,
                          }));
                          closeDropdown(advancedOptionsDropdownId);
                        }}
                      />
                    )}
                  </DropdownMenuItemsContainer>
                </DropdownContent>
              }
            />
          )}
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
                children: isDefined(action.name) ? action.name : t`Email`,
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
