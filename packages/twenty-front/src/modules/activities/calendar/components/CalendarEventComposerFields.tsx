import { ComposerFieldRow } from '@/activities/components/ComposerFieldRow';
import { ComposerHeader } from '@/activities/components/ComposerHeader';
import { StyledComposerTextInput } from '@/activities/components/ComposerTextInput';
import { type useCalendarEventComposer } from '@/activities/calendar/hooks/useCalendarEventComposer';
import { EmailRecipientsFieldInput } from '@/activities/emails/recipients/components/EmailRecipientsFieldInput';
import { useEmailRecipientsDragAndDrop } from '@/activities/emails/recipients/hooks/useEmailRecipientsDragAndDrop';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';
import { type EmailRecipientDragData } from '@/activities/emails/recipients/types/EmailRecipientDragData';
import { getEmailRecipientKey } from '@/activities/emails/recipients/utils/getEmailRecipientKey';
import { type EmailRecipientsByFieldId } from '@/activities/emails/recipients/utils/moveEmailRecipientsBetweenFields';
import { FormBooleanFieldToggleInput } from '@/object-record/record-field/ui/form-types/components/FormBooleanFieldToggleInput';
import { FormDateFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateFieldInput';
import { FormDateTimeFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateTimeFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { AVAILABLE_TIMEZONE_OPTIONS } from '@/settings/experience/constants/AvailableTimezoneOptions';
import { DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION } from '@/ui/utilities/drag-and-drop/constants/DndKitProviderPluginsWithoutDropAnimation';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { DragDropItemDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemDndContext';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { DragDropProvider } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Callout } from 'twenty-ui/feedback';
import { type SelectOption } from 'twenty-ui/input';
import { Select } from '@/ui/input/components/Select';

const StyledFieldsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
`;

type CalendarEventComposerFieldsProps = {
  composerState: ReturnType<typeof useCalendarEventComposer>;
  contextRecord: EmailComposerContextRecord;
  onAddAccount: () => void;
  onReauthorize: () => void;
};

export const CalendarEventComposerFields = ({
  composerState,
  contextRecord,
  onAddAccount,
  onReauthorize,
}: CalendarEventComposerFieldsProps) => {
  const recipientsByFieldId: EmailRecipientsByFieldId = {
    to: composerState.attendees,
    cc: [],
    bcc: [],
  };

  const { contextValues, draggedRecipients, handlers } =
    useEmailRecipientsDragAndDrop({
      recipientsByFieldId,
      onRecipientsByFieldIdChange: ({ to }) => composerState.setAttendees(to),
    });

  const allRecipientKeys = composerState.attendees.map(({ address }) =>
    getEmailRecipientKey(address),
  );

  const draggedSourceIndices =
    draggedRecipients?.fieldId === 'to' ? draggedRecipients.indices : null;

  return (
    <StyledFieldsContainer>
      <DragDropItemDndContext.Provider value={contextValues}>
        <DragDropProvider<EmailRecipientDragData>
          sensors={DND_KIT_SENSORS}
          plugins={DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION}
          onDragStart={handlers.onDragStart}
          onDragMove={handlers.onDragMove}
          onDragEnd={handlers.onDragEnd}
        >
          <ComposerHeader>
            <ComposerFieldRow label={t`Calendar`}>
              <Select
                dropdownId="calendar-event-composer-account"
                fullWidth
                value={composerState.connectedAccountId}
                options={composerState.accountOptions}
                onChange={composerState.setConnectedAccountId}
              />
            </ComposerFieldRow>
            <ComposerFieldRow label={t`Guests`}>
              <EmailRecipientsFieldInput
                fieldId="to"
                draggedSourceIndices={draggedSourceIndices}
                label={t`Guests`}
                recipients={composerState.attendees}
                onChange={composerState.setAttendees}
                onSubmit={composerState.handleCreate}
                excludedSuggestionKeys={allRecipientKeys}
                contextRecord={contextRecord}
              />
            </ComposerFieldRow>
            <ComposerFieldRow label={t`Title`}>
              <StyledComposerTextInput
                type="text"
                aria-label={t`Title`}
                placeholder={t`Add an event title`}
                onChange={(event) => composerState.setTitle(event.target.value)}
              />
            </ComposerFieldRow>
            <ComposerFieldRow label={t`Location`}>
              <StyledComposerTextInput
                type="text"
                aria-label={t`Location`}
                placeholder={t`Add a location`}
                onChange={(event) =>
                  composerState.setLocation(event.target.value)
                }
              />
            </ComposerFieldRow>
          </ComposerHeader>
        </DragDropProvider>
      </DragDropItemDndContext.Provider>

      <WorkflowStepBody>
        {composerState.accountOptions.length === 0 && (
          <Callout
            variant="warning"
            title={t`Connect a calendar account`}
            description={t`Connect Google, Microsoft or CalDAV and enable calendar sync before creating an event.`}
            action={{ label: t`Add account`, onClick: onAddAccount }}
          />
        )}
        {composerState.missingScopes.length > 0 && (
          <Callout
            variant="error"
            title={t`Calendar access needs approval`}
            description={t`Reconnect this account to grant permission to create calendar events.`}
            action={{ label: t`Reconnect`, onClick: onReauthorize }}
          />
        )}
        <FormBooleanFieldToggleInput
          label={t`All day`}
          description={t`Create an all-day event`}
          value={composerState.isFullDay}
          onChange={composerState.handleIsFullDayChange}
        />
        {composerState.isFullDay ? (
          <>
            <FormDateFieldInput
              label={t`Starts`}
              defaultValue={composerState.dates.startsAt}
              onChange={composerState.handleStartsAtChange}
            />
            <FormDateFieldInput
              label={t`Ends`}
              defaultValue={composerState.dates.endsAt}
              onChange={composerState.setEndsAt}
            />
          </>
        ) : (
          <>
            <FormDateTimeFieldInput
              key={`starts-at-${composerState.timeZone}`}
              label={t`Starts`}
              defaultValue={composerState.dates.startsAt}
              onChange={composerState.handleStartsAtChange}
              timeZone={composerState.timeZone}
            />
            <FormDateTimeFieldInput
              key={`ends-at-${composerState.timeZone}`}
              label={t`Ends`}
              defaultValue={composerState.dates.endsAt}
              onChange={composerState.setEndsAt}
              timeZone={composerState.timeZone}
            />
          </>
        )}
        {!composerState.hasValidDateRange && (
          <Callout
            variant="warning"
            title={t`Check the event dates`}
            description={
              composerState.isFullDay
                ? t`The end date must be later than the start date.`
                : t`The end time must be after the start time.`
            }
          />
        )}
        <FormSelectFieldInput
          key={`time-zone-${composerState.timeZone}`}
          label={t`Time zone`}
          defaultValue={composerState.timeZone}
          options={AVAILABLE_TIMEZONE_OPTIONS as SelectOption<string>[]}
          onChange={(value) =>
            isDefined(value) && composerState.setTimeZone(value)
          }
        />
        {composerState.hasTooManyAttendees && (
          <Callout
            variant="warning"
            title={t`Too many guests`}
            description={t`Remove some guests before creating this event.`}
          />
        )}
        <FormBooleanFieldToggleInput
          label={t`Send invitations`}
          description={t`Email guests an invitation`}
          hint={t`When off, the event is created without guests and nobody is notified.`}
          value={composerState.sendInvitations}
          onChange={composerState.setSendInvitations}
        />
        {composerState.sendInvitations &&
          composerState.attendeeEmails.length > 0 && (
            <Callout
              variant="info"
              title={t`Invitations will be sent`}
              description={t`Creating this event will add the guests and email them an invitation.`}
            />
          )}
        {!composerState.hasTargetAssociation && (
          <Callout
            variant="warning"
            title={t`Keep this event related`}
            description={t`Keep the current record in the guest list and leave invitations on so the event remains visible on this record.`}
          />
        )}
        <FormBooleanFieldToggleInput
          label={t`Video conferencing`}
          description={t`Add a meeting link`}
          hint={t`Google Meet or Microsoft Teams will be used when supported by the selected account.`}
          value={composerState.addConferencing}
          onChange={composerState.setAddConferencing}
        />
        <FormTextFieldInput
          label={t`Description`}
          placeholder={t`Add details for guests`}
          multiline
          defaultValue=""
          onChange={composerState.setDescription}
        />
      </WorkflowStepBody>
    </StyledFieldsContainer>
  );
};
