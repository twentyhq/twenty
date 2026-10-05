import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { buildConnectedAccountSenderOptions } from '@/accounts/utils/buildConnectedAccountSenderOptions';
import { getMissingDraftEmailScopes } from '@/accounts/utils/hasMissingDraftEmailScopes';
import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FormMultiTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiTextFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { WORKFLOW_STEP_CONNECTED_ACCOUNT_HANDLE } from '@/workflow/graphql/queries/workflowStepConnectedAccountHandle';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { type WorkflowEmailAction } from '@/workflow/types/WorkflowEmailAction';
import { getWorkflowStepDisplayName } from '@/workflow/utils/getWorkflowStepDisplayName';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowSendEmailAttachments } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowSendEmailAttachments';
import { WORKFLOW_EMAIL_BODY_EDITOR_PROFILE } from '@/workflow/workflow-steps/workflow-actions/constants/WorkflowEmailBodyEditorProfile';
import { useEmailForm } from '@/workflow/workflow-steps/workflow-actions/hooks/useEmailForm';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import {
  ConnectedAccountProvider,
  EmailOperation,
  SettingsPath,
} from 'twenty-shared/types';
import {
  canConnectedAccountPerformEmailOperation,
  getSendableEmailHandles,
  isDefined,
} from 'twenty-shared/utils';
import { isStandaloneVariableString } from 'twenty-shared/workflow';
import { Callout, Dropdown } from 'twenty-ui/components';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

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
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const hasConnectedAccountsPermission = useHasPermissionFlag(
    PermissionFlagType.CONNECTED_ACCOUNTS,
  );

  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);

  const redirectUrl = `/object/workflow/${workflowVisualizerWorkflowId}`;

  const { formData, handleFieldChange, handleFieldsChange, saveAction } =
    useEmailForm({
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
    inReplyTo: boolean;
  }>(() => {
    const inputRecipients = action.settings.input.recipients;

    return {
      cc: Boolean(inputRecipients?.cc),
      bcc: Boolean(inputRecipients?.bcc),
      inReplyTo: Boolean(action.settings.input.inReplyTo),
    };
  });

  const advancedOptionsDropdownId = `${action.id}-email-advanced-options`;

  const hasAvailableAdvancedOptions =
    !visibleAdvancedFields.cc ||
    !visibleAdvancedFields.bcc ||
    !visibleAdvancedFields.inReplyTo;

  const handleReauthorize = async () => {
    if (!isDefined(missingScopes)) {
      return;
    }

    await triggerApisOAuth(missingScopes.provider, {
      redirectLocation: redirectUrl,
      loginHint: missingScopes.loginHint,
    });
  };

  const apolloCoreClient = useApolloCoreClient();

  const navigate = useNavigateSettings();

  const { closeSidePanelMenu } = useSidePanelMenu();

  const { accounts: myAccounts, loading: myAccountsLoading } =
    useMyConnectedAccounts();

  const configuredAccountId = formData.connectedAccountId;
  const isSenderVariable = isStandaloneVariableString(configuredAccountId);
  const isConfiguredAccountMine = myAccounts.some(
    (account) => account.id === configuredAccountId,
  );

  const { data: otherAccountData, loading: otherAccountLoading } = useQuery<{
    workflowStepConnectedAccountHandle: Pick<
      ConnectedAccount,
      'id' | 'handle' | 'provider' | 'handleAliases'
    > | null;
  }>(WORKFLOW_STEP_CONNECTED_ACCOUNT_HANDLE, {
    client: apolloCoreClient,
    variables: { connectedAccountId: configuredAccountId },
    skip:
      !isDefined(configuredAccountId) ||
      configuredAccountId === '' ||
      isSenderVariable ||
      isConfiguredAccountMine,
  });

  const loading = myAccountsLoading || otherAccountLoading;

  const otherAccount =
    otherAccountData?.workflowStepConnectedAccountHandle ?? null;

  const ownAccount = myAccounts.find(
    (account) => account.id === configuredAccountId,
  );

  const missingDraftScopes =
    action.type === 'DRAFT_EMAIL' && isDefined(ownAccount)
      ? getMissingDraftEmailScopes(ownAccount)
      : [];

  const missingScopes =
    isDefined(ownAccount) &&
    ownAccount.provider !== ConnectedAccountProvider.IMAP_SMTP_CALDAV &&
    missingDraftScopes.length > 0
      ? {
          provider: ownAccount.provider,
          loginHint: ownAccount.handle,
        }
      : null;

  const sendableAccounts = [
    ...myAccounts.filter((connectedAccount) =>
      canConnectedAccountPerformEmailOperation({
        connectedAccount,
        operation: EmailOperation.SEND,
      }),
    ),
    ...(isDefined(otherAccount) ? [otherAccount] : []),
  ];

  const senderOptions = buildConnectedAccountSenderOptions(sendableAccounts);

  const configuredAccount = ownAccount ?? otherAccount;

  const configuredSenderHandle = isNonEmptyString(formData.fromHandle)
    ? formData.fromHandle
    : configuredAccount?.handle;

  const selectedSenderValue = isSenderVariable
    ? configuredAccountId
    : configuredSenderHandle;

  const handleSenderChange = (senderValue: string | null) => {
    if (!isNonEmptyString(senderValue)) {
      handleFieldsChange({ connectedAccountId: '', fromHandle: '' });

      return;
    }

    if (isStandaloneVariableString(senderValue)) {
      handleFieldsChange({ connectedAccountId: senderValue, fromHandle: '' });

      return;
    }

    const senderAccount = sendableAccounts.find((account) =>
      getSendableEmailHandles(account).includes(senderValue),
    );

    if (!isDefined(senderAccount)) {
      return;
    }

    handleFieldsChange({
      connectedAccountId: senderAccount.id,
      fromHandle: senderValue,
    });
  };

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  return (
    !loading && (
      <>
        <WorkflowStepBody>
          <FormSelectFieldInput
            key={`sender-${selectedSenderValue ?? 'none'}`}
            label={t`From`}
            hint={t`Pick an address to send from or set a workspace member as variable`}
            defaultValue={selectedSenderValue}
            options={senderOptions}
            onChange={handleSenderChange}
            VariablePicker={WorkflowVariablePicker}
            readonly={actionOptions.readonly}
            callToActionButton={
              hasConnectedAccountsPermission
                ? {
                    onClick: () => {
                      closeSidePanelMenu();
                      navigate(SettingsPath.NewAccount);
                    },
                    Icon: IconPlus,
                    text: t`Add account`,
                  }
                : undefined
            }
          />
          {isDefined(missingScopes) && (
            <>
              <Callout
                variant={'error'}
                title={t`Missing email draft permission.`}
                description={
                  hasConnectedAccountsPermission
                    ? t`This account is connected, but we don't have permission to draft emails on your behalf yet. You'll be redirected to approve this access.`
                    : t`Ask a workspace admin for the Sync Account permission to reconnect this account.`
                }
                action={
                  hasConnectedAccountsPermission
                    ? { label: t`Reauthorize`, onClick: handleReauthorize }
                    : undefined
                }
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
          {visibleAdvancedFields.inReplyTo && (
            <FormTextFieldInput
              label={t`In-Reply-To`}
              placeholder={t`Enter Message-ID to reply to`}
              readonly={actionOptions.readonly}
              defaultValue={formData.inReplyTo}
              onChange={(value) => {
                handleFieldChange('inReplyTo', value);
              }}
              VariablePicker={WorkflowVariablePicker}
            />
          )}
          {!actionOptions.readonly && hasAvailableAdvancedOptions && (
            <DropdownRoot dropdownId={advancedOptionsDropdownId} type="menu">
              <Dropdown.Trigger render={<Button size="sm" variant="outline" />}>
                {t`Advanced options`}
              </Dropdown.Trigger>
              <DropdownContent
                width={GenericDropdownContentWidth.Medium}
                align="start"
              >
                <Dropdown.Section>
                  {!visibleAdvancedFields.cc && (
                    <Dropdown.ActionItem
                      onClick={() => {
                        setVisibleAdvancedFields((previousFields) => ({
                          ...previousFields,
                          cc: true,
                        }));
                      }}
                    >{t`Add CC`}</Dropdown.ActionItem>
                  )}
                  {!visibleAdvancedFields.bcc && (
                    <Dropdown.ActionItem
                      onClick={() => {
                        setVisibleAdvancedFields((previousFields) => ({
                          ...previousFields,
                          bcc: true,
                        }));
                      }}
                    >{t`Add BCC`}</Dropdown.ActionItem>
                  )}
                  {!visibleAdvancedFields.inReplyTo && (
                    <Dropdown.ActionItem
                      onClick={() => {
                        setVisibleAdvancedFields((previousFields) => ({
                          ...previousFields,
                          inReplyTo: true,
                        }));
                      }}
                    >{t`Add In-Reply-To`}</Dropdown.ActionItem>
                  )}
                </Dropdown.Section>
              </DropdownContent>
            </DropdownRoot>
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
                children: isDefined(action.name)
                  ? getWorkflowStepDisplayName({
                      name: action.name,
                      type: action.type,
                    })
                  : t`Email`,
                href: '#',
              },
              {
                children: t`Email Editor`,
              },
            ]}
            profile={WORKFLOW_EMAIL_BODY_EDITOR_PROFILE}
          />
          <WorkflowSendEmailAttachments
            label={t`Attachments`}
            files={formData.files}
            readonly={actionOptions.readonly}
            onChange={(files) => {
              handleFieldChange('files', files);
            }}
            VariablePicker={WorkflowVariablePicker}
          />
        </WorkflowStepBody>
        {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
      </>
    )
  );
};
