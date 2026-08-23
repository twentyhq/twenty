import { type useCalendarEventComposer } from '@/activities/calendar/hooks/useCalendarEventComposer';
import { FormBooleanFieldToggleInput } from '@/object-record/record-field/ui/form-types/components/FormBooleanFieldToggleInput';
import { FormDateFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateFieldInput';
import { FormDateTimeFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateTimeFieldInput';
import { FormMultiTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiTextFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { AVAILABLE_TIMEZONE_OPTIONS } from '@/settings/experience/constants/AvailableTimezoneOptions';
import { t } from '@lingui/core/macro';
import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { Callout } from 'twenty-ui/feedback';
import { IconPlus } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/input';

type CalendarEventComposerFieldsProps = {
  composerState: ReturnType<typeof useCalendarEventComposer>;
  defaultAttendees: string;
  onAddAccount: () => void;
  onReauthorize: () => void;
};

export const CalendarEventComposerFields = ({
  composerState,
  defaultAttendees,
  onAddAccount,
  onReauthorize,
}: CalendarEventComposerFieldsProps) => (
  <>
    <FormSelectFieldInput
      key={`calendar-account-${composerState.connectedAccountId || 'none'}`}
      label={t`Calendar`}
      hint={t`The connected account where this event will be created.`}
      defaultValue={composerState.connectedAccountId}
      options={composerState.accountOptions}
      onChange={(value) => composerState.setConnectedAccountId(value ?? '')}
      callToActionButton={{
        onClick: onAddAccount,
        Icon: IconPlus,
        text: t`Add account`,
      }}
    />
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
    <FormTextFieldInput
      label={t`Title`}
      placeholder={t`Add an event title`}
      defaultValue=""
      onChange={composerState.setTitle}
    />
    <FormTextFieldInput
      label={t`Description`}
      placeholder={t`Add details for attendees`}
      multiline
      defaultValue=""
      onChange={composerState.setDescription}
    />
    <FormTextFieldInput
      label={t`Location`}
      placeholder={t`Add a location`}
      defaultValue=""
      onChange={composerState.setLocation}
    />
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
      onChange={(value) => isDefined(value) && composerState.setTimeZone(value)}
    />
    <FormMultiTextFieldInput
      label={t`Attendees`}
      placeholder={t`Enter emails, comma-separated`}
      defaultValue={defaultAttendees}
      onChange={composerState.setAttendees}
    />
    {(composerState.invalidAttendeeEmails.length > 0 ||
      composerState.hasTooManyAttendees) && (
      <Callout
        variant="warning"
        title={t`Check the attendee list`}
        description={
          composerState.hasTooManyAttendees
            ? t`The event has more than ${MAX_EMAIL_RECIPIENTS} attendees.`
            : t`One or more attendee email addresses are invalid.`
        }
      />
    )}
    <FormBooleanFieldToggleInput
      label={t`Send invitations`}
      description={t`Email attendees an invitation`}
      hint={t`When off, the event is created without attendees and nobody is notified.`}
      value={composerState.sendInvitations}
      onChange={composerState.setSendInvitations}
    />
    {composerState.sendInvitations &&
      composerState.attendeeEmails.length > 0 && (
        <Callout
          variant="info"
          title={t`Invitations will be sent`}
          description={t`Creating this event will add the attendees and email them an invitation.`}
        />
      )}
    {!composerState.hasTargetAssociation && (
      <Callout
        variant="warning"
        title={t`Keep this event related`}
        description={t`Keep the current record's email in the attendee list and leave invitations on so the event remains visible on this record.`}
      />
    )}
    <FormBooleanFieldToggleInput
      label={t`Video conferencing`}
      description={t`Add a meeting link`}
      hint={t`Google Meet or Microsoft Teams will be used when supported by the selected account.`}
      value={composerState.addConferencing}
      onChange={composerState.setAddConferencing}
    />
  </>
);
