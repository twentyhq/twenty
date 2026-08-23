import { getMissingCreateCalendarEventScopes } from '@/accounts/utils/hasMissingCreateCalendarEventScopes';
import { useCreateCalendarEvent } from '@/activities/calendar/hooks/useCreateCalendarEvent';
import { type CalendarEventComposerInitialValues } from '@/activities/calendar/types/CalendarEventComposerInitialValues';
import { getCalendarEventComposerDefaultDates } from '@/activities/calendar/utils/getCalendarEventComposerDefaultDates';
import { getCalendarEventDatesAfterModeChange } from '@/activities/calendar/utils/getCalendarEventDatesAfterModeChange';
import { getCalendarEventDatesAfterStartChange } from '@/activities/calendar/utils/getCalendarEventDatesAfterStartChange';
import { hasCalendarEventTargetAssociation } from '@/activities/calendar/utils/hasCalendarEventTargetAssociation';
import { isCalendarCreationEnabledForAccount } from '@/activities/calendar/utils/isCalendarCreationEnabledForAccount';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback, useState } from 'react';
import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { emailSchema, isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/input';
import { Temporal } from 'temporal-polyfill';

export const useCalendarEventComposer = ({
  initialValues,
  onCreated,
}: {
  initialValues: CalendarEventComposerInitialValues | null;
  onCreated: () => void;
}) => {
  const { accounts, loading: accountsLoading } = useMyConnectedAccounts();
  const { createCalendarEvent, loading: isCreating } = useCreateCalendarEvent();

  const [connectedAccountId, setConnectedAccountId] = useState(
    initialValues?.connectedAccountId ?? '',
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [timeZone, setTimeZone] = useState(initialValues?.timeZone ?? 'UTC');
  const [isFullDay, setIsFullDay] = useState(false);
  const [attendees, setAttendees] = useState(
    initialValues?.defaultAttendees ?? '',
  );
  const [sendInvitations, setSendInvitations] = useState(true);
  const [addConferencing, setAddConferencing] = useState(false);
  const [dates, setDates] = useState(() =>
    getCalendarEventComposerDefaultDates({
      now: Temporal.Now.instant(),
      timeZone: initialValues?.timeZone ?? 'UTC',
    }),
  );

  const calendarAccounts = accounts.filter(isCalendarCreationEnabledForAccount);
  const accountOptions: SelectOption<string>[] = calendarAccounts.map(
    (account) => ({ label: account.handle, value: account.id }),
  );
  const selectedAccount = calendarAccounts.find(
    (account) => account.id === connectedAccountId,
  );
  const missingScopes = isDefined(selectedAccount)
    ? getMissingCreateCalendarEventScopes(selectedAccount)
    : [];

  const attendeeEmails = attendees
    .split(',')
    .map((email) => email.trim())
    .filter(isNonEmptyString);
  const invalidAttendeeEmails = sendInvitations
    ? attendeeEmails.filter((email) => !emailSchema.safeParse(email).success)
    : [];
  const hasTooManyAttendees =
    sendInvitations && attendeeEmails.length > MAX_EMAIL_RECIPIENTS;
  const hasTargetAssociation = hasCalendarEventTargetAssociation({
    attendeeEmails,
    requiredAttendee: initialValues?.defaultAttendees,
    sendInvitations,
  });
  const hasValidDateRange = isFullDay
    ? dates.endsAt.slice(0, 10) > dates.startsAt.slice(0, 10)
    : Date.parse(dates.endsAt) > Date.parse(dates.startsAt);

  const canCreate =
    isNonEmptyString(title.trim()) &&
    isDefined(selectedAccount) &&
    missingScopes.length === 0 &&
    invalidAttendeeEmails.length === 0 &&
    !hasTooManyAttendees &&
    hasTargetAssociation &&
    hasValidDateRange &&
    !isCreating;

  const handleIsFullDayChange = (nextIsFullDay: boolean) => {
    setDates(
      getCalendarEventDatesAfterModeChange({
        dates,
        isFullDay: nextIsFullDay,
        timeZone,
      }),
    );

    setIsFullDay(nextIsFullDay);
  };

  const handleStartsAtChange = (value: string | null) => {
    if (!isDefined(value)) {
      return;
    }

    setDates((currentDates) =>
      getCalendarEventDatesAfterStartChange({
        dates: currentDates,
        startsAt: value,
        isFullDay,
      }),
    );
  };

  const setEndsAt = (value: string | null) => {
    if (isDefined(value)) {
      setDates((currentDates) => ({ ...currentDates, endsAt: value }));
    }
  };

  const handleCreate = useCallback(async () => {
    if (!canCreate) {
      return;
    }

    const success = await createCalendarEvent({
      connectedAccountId,
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      startsAt: dates.startsAt,
      endsAt: dates.endsAt,
      isFullDay,
      timeZone,
      attendees,
      sendInvitations,
      addConferencing,
    });

    if (success) {
      onCreated();
    }
  }, [
    addConferencing,
    attendees,
    canCreate,
    connectedAccountId,
    createCalendarEvent,
    dates.endsAt,
    dates.startsAt,
    description,
    isFullDay,
    location,
    onCreated,
    sendInvitations,
    timeZone,
    title,
  ]);

  return {
    accountOptions,
    accountsLoading,
    addConferencing,
    attendeeEmails,
    canCreate,
    connectedAccountId,
    dates,
    handleCreate,
    handleIsFullDayChange,
    handleStartsAtChange,
    hasTooManyAttendees,
    hasTargetAssociation,
    hasValidDateRange,
    invalidAttendeeEmails,
    isFullDay,
    missingScopes,
    selectedAccount,
    sendInvitations,
    setAddConferencing,
    setAttendees,
    setConnectedAccountId,
    setDescription,
    setEndsAt,
    setLocation,
    setSendInvitations,
    setTimeZone,
    setTitle,
    timeZone,
  };
};
