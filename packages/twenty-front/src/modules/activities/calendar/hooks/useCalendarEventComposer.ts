import { getMissingCreateCalendarEventScopes } from '@/accounts/utils/hasMissingCreateCalendarEventScopes';
import { useCalendarEventTargetRelatedPersonIds } from '@/activities/calendar/hooks/useCalendarEventTargetRelatedPersonIds';
import { useCreateCalendarEvent } from '@/activities/calendar/hooks/useCreateCalendarEvent';
import { isCalendarEventComposerCreatingState } from '@/activities/calendar/states/isCalendarEventComposerCreatingState';
import { type CalendarEventComposerInitialValues } from '@/activities/calendar/types/CalendarEventComposerInitialValues';
import { getCalendarEventComposerDefaultDates } from '@/activities/calendar/utils/getCalendarEventComposerDefaultDates';
import { getCalendarEventDatesAfterModeChange } from '@/activities/calendar/utils/getCalendarEventDatesAfterModeChange';
import { getCalendarEventDatesAfterStartChange } from '@/activities/calendar/utils/getCalendarEventDatesAfterStartChange';
import { hasCalendarEventTargetAssociation } from '@/activities/calendar/utils/hasCalendarEventTargetAssociation';
import { isCalendarCreationEnabledForAccount } from '@/activities/calendar/utils/isCalendarCreationEnabledForAccount';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { isValidEmailRecipientAddress } from '@/activities/emails/recipients/utils/isValidEmailRecipientAddress';
import { parseEmailRecipients } from '@/activities/emails/recipients/utils/parseEmailRecipients';
import { serializeEmailRecipients } from '@/activities/emails/recipients/utils/serializeEmailRecipients';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback, useState } from 'react';
import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
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
  const store = useStore();
  const isCalendarEventComposerCreating = useAtomStateValue(
    isCalendarEventComposerCreatingState,
  );

  const [connectedAccountId, setConnectedAccountId] = useState(
    initialValues?.connectedAccountId ?? '',
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [timeZone, setTimeZone] = useState(initialValues?.timeZone ?? 'UTC');
  const [isFullDay, setIsFullDay] = useState(false);
  const [attendees, setAttendees] = useState<EmailRecipient[]>(() =>
    parseEmailRecipients(initialValues?.defaultAttendees ?? '').map(
      (attendee) => ({
        ...attendee,
        personId: initialValues?.defaultAttendeePersonId,
      }),
    ),
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
  const relatedPersonIds = useCalendarEventTargetRelatedPersonIds(
    initialValues?.contextRecord,
  );
  const accountOptions: SelectOption<string>[] = calendarAccounts.map(
    (account) => ({ label: account.handle, value: account.id }),
  );
  const selectedAccount = calendarAccounts.find(
    (account) => account.id === connectedAccountId,
  );
  const missingScopes = isDefined(selectedAccount)
    ? getMissingCreateCalendarEventScopes(selectedAccount)
    : [];

  const attendeeEmails = attendees.map(({ address }) => address);
  const invalidAttendeeEmails = sendInvitations
    ? attendeeEmails.filter((email) => !isValidEmailRecipientAddress(email))
    : [];
  const hasTooManyAttendees =
    sendInvitations && attendeeEmails.length > MAX_EMAIL_RECIPIENTS;
  const hasTargetAssociation = hasCalendarEventTargetAssociation({
    attendees,
    relatedPersonIds,
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
    !isCreating &&
    !isCalendarEventComposerCreating;

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
      setDates((currentDates) => ({
        ...currentDates,
        endsAt:
          isFullDay && value.slice(0, 10) <= currentDates.startsAt.slice(0, 10)
            ? Temporal.PlainDate.from(currentDates.startsAt.slice(0, 10))
                .add({ days: 1 })
                .toString()
            : value,
      }));
    }
  };

  const handleCreate = useCallback(async () => {
    if (!canCreate || store.get(isCalendarEventComposerCreatingState.atom)) {
      return;
    }

    store.set(isCalendarEventComposerCreatingState.atom, true);

    try {
      const success = await createCalendarEvent({
        connectedAccountId,
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        startsAt: dates.startsAt,
        endsAt: dates.endsAt,
        isFullDay,
        timeZone,
        attendees: serializeEmailRecipients(attendees),
        sendInvitations,
        addConferencing,
      });

      if (success) {
        onCreated();
      }
    } finally {
      store.set(isCalendarEventComposerCreatingState.atom, false);
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
    store,
    timeZone,
    title,
  ]);

  return {
    accountOptions,
    accountsLoading,
    addConferencing,
    attendees,
    attendeeEmails,
    canCreate,
    connectedAccountId,
    dates,
    description,
    handleCreate,
    handleIsFullDayChange,
    handleStartsAtChange,
    hasTooManyAttendees,
    hasTargetAssociation,
    hasValidDateRange,
    invalidAttendeeEmails,
    isFullDay,
    location,
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
