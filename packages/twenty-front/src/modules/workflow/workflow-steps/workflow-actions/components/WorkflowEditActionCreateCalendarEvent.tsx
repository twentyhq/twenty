import { getMissingCreateCalendarEventScopes } from '@/accounts/utils/hasMissingCreateCalendarEventScopes';
import { FormBooleanFieldToggleInput } from '@/object-record/record-field/ui/form-types/components/FormBooleanFieldToggleInput';
import { FormDateTimeFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateTimeFieldInput';
import { FormMultiTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiTextFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { AVAILABLE_TIMEZONE_OPTIONS } from '@/settings/experience/constants/AvailableTimezoneOptions';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { type WorkflowCreateCalendarEventAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { useCalendarEventForm } from '@/workflow/workflow-steps/workflow-actions/hooks/useCalendarEventForm';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { t } from '@lingui/core/macro';
import { useEffect } from 'react';
import { ConnectedAccountProvider, SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Callout } from 'twenty-ui/feedback';
import { type SelectOption } from 'twenty-ui/input';
import { IconPlus } from 'twenty-ui/icon';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const CALENDAR_CAPABLE_PROVIDERS = [
  ConnectedAccountProvider.GOOGLE,
  ConnectedAccountProvider.MICROSOFT,
];

type WorkflowEditActionCreateCalendarEventProps = {
  action: WorkflowCreateCalendarEventAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowCreateCalendarEventAction) => void;
      };
};

export const WorkflowEditActionCreateCalendarEvent = ({
  action,
  actionOptions,
}: WorkflowEditActionCreateCalendarEventProps) => {
  const { formData, handleFieldChange, saveAction } = useCalendarEventForm({
    action,
    onActionUpdate:
      actionOptions.readonly === true
        ? undefined
        : actionOptions.onActionUpdate,
    readonly: actionOptions.readonly === true,
  });

  const navigate = useNavigateSettings();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { accounts: myAccounts, loading } = useMyConnectedAccounts();
  const { triggerApisOAuth } = useTriggerApisOAuth();

  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const redirectUrl = `/object/workflow/${workflowVisualizerWorkflowId}`;

  const connectedAccountOptions: SelectOption<string>[] = myAccounts
    .filter((account) => {
      if (account.provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV) {
        return isDefined(account.connectionParameters?.CALDAV);
      }

      return CALENDAR_CAPABLE_PROVIDERS.includes(account.provider);
    })
    .map((account) => ({ label: account.handle, value: account.id }));

  const selectedAccount = myAccounts.find(
    (account) => account.id === formData.connectedAccountId,
  );

  const missingScopes =
    isDefined(selectedAccount) &&
    getMissingCreateCalendarEventScopes(selectedAccount).length > 0
      ? {
          provider: selectedAccount.provider,
          loginHint: selectedAccount.handle,
        }
      : null;

  const handleReauthorize = async () => {
    if (!isDefined(missingScopes)) {
      return;
    }

    await triggerApisOAuth(missingScopes.provider, {
      redirectLocation: redirectUrl,
      loginHint: missingScopes.loginHint,
    });
  };

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  if (loading) {
    return null;
  }

  return (
    <>
      <WorkflowStepBody>
        <FormSelectFieldInput
          key={`connected-account-${formData.connectedAccountId || 'none'}`}
          label={t`Account`}
          hint={t`Google, Microsoft or CalDAV account to create the event on. Leave empty to use the default calendar account.`}
          defaultValue={formData.connectedAccountId}
          options={connectedAccountOptions}
          onChange={(value) =>
            handleFieldChange('connectedAccountId', value ?? '')
          }
          readonly={actionOptions.readonly}
          callToActionButton={{
            onClick: () => {
              closeSidePanelMenu();
              navigate(SettingsPath.NewAccount);
            },
            Icon: IconPlus,
            text: t`Add account`,
          }}
        />
        {isDefined(missingScopes) && (
          <Callout
            variant={'error'}
            title={t`Missing calendar permission.`}
            description={t`This account is connected, but we don't have permission to create calendar events on your behalf yet. You'll be redirected to approve this access.`}
            action={{
              label: t`Reauthorize`,
              onClick: handleReauthorize,
            }}
          />
        )}
        <FormTextFieldInput
          label={t`Title`}
          placeholder={t`Enter event title`}
          readonly={actionOptions.readonly}
          defaultValue={formData.title}
          onChange={(value) => handleFieldChange('title', value)}
          VariablePicker={WorkflowVariablePicker}
        />
        <FormTextFieldInput
          label={t`Description`}
          placeholder={t`Enter event description`}
          multiline
          readonly={actionOptions.readonly}
          defaultValue={formData.description}
          onChange={(value) => handleFieldChange('description', value)}
          VariablePicker={WorkflowVariablePicker}
        />
        <FormTextFieldInput
          label={t`Location`}
          placeholder={t`Enter event location`}
          readonly={actionOptions.readonly}
          defaultValue={formData.location}
          onChange={(value) => handleFieldChange('location', value)}
          VariablePicker={WorkflowVariablePicker}
        />
        <FormDateTimeFieldInput
          label={t`Starts at`}
          placeholder={t`Select a date and time`}
          readonly={actionOptions.readonly}
          defaultValue={formData.startsAt}
          onChange={(value) => handleFieldChange('startsAt', value ?? '')}
          VariablePicker={WorkflowVariablePicker}
        />
        <FormDateTimeFieldInput
          label={t`Ends at`}
          placeholder={t`Select a date and time`}
          readonly={actionOptions.readonly}
          defaultValue={formData.endsAt}
          onChange={(value) => handleFieldChange('endsAt', value ?? '')}
          VariablePicker={WorkflowVariablePicker}
        />
        <FormSelectFieldInput
          label={t`Time zone`}
          defaultValue={formData.timeZone}
          options={AVAILABLE_TIMEZONE_OPTIONS as SelectOption<string>[]}
          onChange={(value) => handleFieldChange('timeZone', value ?? '')}
          readonly={actionOptions.readonly}
          VariablePicker={WorkflowVariablePicker}
        />
        <FormBooleanFieldToggleInput
          label={t`All day`}
          description={t`Create the event as an all-day event`}
          value={formData.isFullDay}
          onChange={(value) => handleFieldChange('isFullDay', value)}
          disabled={actionOptions.readonly}
        />
        <FormMultiTextFieldInput
          label={t`Attendees`}
          placeholder={t`Enter emails, comma-separated`}
          readonly={actionOptions.readonly}
          defaultValue={formData.attendees}
          onChange={(value) => handleFieldChange('attendees', value)}
          VariablePicker={WorkflowVariablePicker}
        />
        <FormBooleanFieldToggleInput
          label={t`Send invitations`}
          description={t`Email the attendees an invitation`}
          hint={t`When off, the event is created with no attendees and nobody is notified.`}
          value={formData.sendInvitations}
          onChange={(value) => handleFieldChange('sendInvitations', value)}
          disabled={actionOptions.readonly}
        />
        <FormBooleanFieldToggleInput
          label={t`Add conferencing`}
          description={t`Add a video conferencing link`}
          hint={t`Generates a Google Meet or Microsoft Teams link depending on the account.`}
          value={formData.addConferencing}
          onChange={(value) => handleFieldChange('addConferencing', value)}
          disabled={actionOptions.readonly}
        />
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
