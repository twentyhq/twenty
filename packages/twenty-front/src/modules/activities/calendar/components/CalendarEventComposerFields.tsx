import { ComposerFieldRow } from '@/activities/components/ComposerFieldRow';
import { ComposerHeader } from '@/activities/components/ComposerHeader';
import { StyledComposerTextInput } from '@/activities/components/ComposerTextInput';
import { CalendarEventLocationInput } from '@/activities/calendar/components/CalendarEventLocationInput';
import { type useCalendarEventComposer } from '@/activities/calendar/hooks/useCalendarEventComposer';
import { EmailRecipientsFieldInput } from '@/activities/emails/recipients/components/EmailRecipientsFieldInput';
import { useEmailRecipientsDragAndDrop } from '@/activities/emails/recipients/hooks/useEmailRecipientsDragAndDrop';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';
import { type EmailRecipientDragData } from '@/activities/emails/recipients/types/EmailRecipientDragData';
import { getEmailRecipientKey } from '@/activities/emails/recipients/utils/getEmailRecipientKey';
import { type EmailRecipientsByFieldId } from '@/activities/emails/recipients/utils/moveEmailRecipientsBetweenFields';
import { FormDateFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateFieldInput';
import { FormDateTimeFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateTimeFieldInput';
import { AVAILABLE_TIMEZONE_OPTIONS } from '@/settings/experience/constants/AvailableTimezoneOptions';
import { Select } from '@/ui/input/components/Select';
import { TextArea } from '@/ui/input/components/TextArea';
import { DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION } from '@/ui/utilities/drag-and-drop/constants/DndKitProviderPluginsWithoutDropAnimation';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { DragDropItemDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemDndContext';
import { DragDropProvider } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Callout } from 'twenty-ui/feedback';
import { Toggle } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const COMPOSER_LABEL_MIN_WIDTH = '80px';

const StyledFieldsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  width: 100%;
`;

const StyledRowDescription = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledNoticesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
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

  const hasNotices =
    composerState.accountOptions.length === 0 ||
    composerState.missingScopes.length > 0 ||
    !composerState.hasValidDateRange ||
    composerState.hasTooManyAttendees ||
    !composerState.hasTargetAssociation;

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
            <ComposerFieldRow
              label={t`Calendar`}
              labelMinWidth={COMPOSER_LABEL_MIN_WIDTH}
            >
              <Select
                dropdownId="calendar-event-composer-account"
                fullWidth
                variant="transparent"
                value={composerState.connectedAccountId}
                options={composerState.accountOptions}
                onChange={composerState.setConnectedAccountId}
              />
            </ComposerFieldRow>
            <ComposerFieldRow
              label={t`Guests`}
              labelMinWidth={COMPOSER_LABEL_MIN_WIDTH}
            >
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
            <ComposerFieldRow
              label={t`Title`}
              labelMinWidth={COMPOSER_LABEL_MIN_WIDTH}
            >
              <StyledComposerTextInput
                type="text"
                aria-label={t`Title`}
                placeholder={t`Add an event title`}
                onChange={(event) => composerState.setTitle(event.target.value)}
              />
            </ComposerFieldRow>
            <ComposerFieldRow
              label={t`Location`}
              labelMinWidth={COMPOSER_LABEL_MIN_WIDTH}
            >
              <CalendarEventLocationInput
                ariaLabel={t`Location`}
                placeholder={t`Add a location`}
                value={composerState.location}
                onChange={composerState.setLocation}
              />
            </ComposerFieldRow>
            <ComposerFieldRow
              label={t`All day`}
              labelMinWidth={COMPOSER_LABEL_MIN_WIDTH}
              onClick={() =>
                composerState.handleIsFullDayChange(!composerState.isFullDay)
              }
              trailing={
                <Toggle
                  aria-label={t`All day`}
                  toggleSize="small"
                  centered
                  value={composerState.isFullDay}
                  onChange={composerState.handleIsFullDayChange}
                />
              }
            >
              <StyledRowDescription>
                {t`Create an all-day event`}
              </StyledRowDescription>
            </ComposerFieldRow>
            {composerState.isFullDay ? (
              <>
                <ComposerFieldRow
                  label={t`Starts`}
                  labelMinWidth={COMPOSER_LABEL_MIN_WIDTH}
                >
                  <FormDateFieldInput
                    variant="transparent"
                    defaultValue={composerState.dates.startsAt}
                    onChange={composerState.handleStartsAtChange}
                  />
                </ComposerFieldRow>
                <ComposerFieldRow
                  label={t`Ends`}
                  labelMinWidth={COMPOSER_LABEL_MIN_WIDTH}
                >
                  <FormDateFieldInput
                    key={composerState.dates.endsAt}
                    variant="transparent"
                    defaultValue={composerState.dates.endsAt}
                    onChange={composerState.setEndsAt}
                  />
                </ComposerFieldRow>
              </>
            ) : (
              <>
                <ComposerFieldRow
                  label={t`Starts`}
                  labelMinWidth={COMPOSER_LABEL_MIN_WIDTH}
                >
                  <FormDateTimeFieldInput
                    key={`starts-at-${composerState.timeZone}`}
                    variant="transparent"
                    defaultValue={composerState.dates.startsAt}
                    onChange={composerState.handleStartsAtChange}
                    timeZone={composerState.timeZone}
                  />
                </ComposerFieldRow>
                <ComposerFieldRow
                  label={t`Ends`}
                  labelMinWidth={COMPOSER_LABEL_MIN_WIDTH}
                >
                  <FormDateTimeFieldInput
                    key={`ends-at-${composerState.dates.endsAt}-${composerState.timeZone}`}
                    variant="transparent"
                    defaultValue={composerState.dates.endsAt}
                    onChange={composerState.setEndsAt}
                    timeZone={composerState.timeZone}
                  />
                </ComposerFieldRow>
              </>
            )}
            <ComposerFieldRow
              label={t`Time zone`}
              labelMinWidth={COMPOSER_LABEL_MIN_WIDTH}
            >
              <Select
                dropdownId="calendar-event-composer-time-zone"
                fullWidth
                variant="transparent"
                withSearchInput
                value={composerState.timeZone}
                options={AVAILABLE_TIMEZONE_OPTIONS}
                onChange={composerState.setTimeZone}
              />
            </ComposerFieldRow>
            <ComposerFieldRow
              label={t`Invitations`}
              labelMinWidth={COMPOSER_LABEL_MIN_WIDTH}
              onClick={() =>
                composerState.setSendInvitations(!composerState.sendInvitations)
              }
              trailing={
                <Toggle
                  aria-label={t`Send invitations`}
                  toggleSize="small"
                  centered
                  value={composerState.sendInvitations}
                  onChange={composerState.setSendInvitations}
                />
              }
            >
              <StyledRowDescription>
                {t`Email guests an invitation`}
              </StyledRowDescription>
            </ComposerFieldRow>
            <ComposerFieldRow
              label={t`Video call`}
              labelMinWidth={COMPOSER_LABEL_MIN_WIDTH}
              onClick={() =>
                composerState.setAddConferencing(!composerState.addConferencing)
              }
              trailing={
                <Toggle
                  aria-label={t`Video conferencing`}
                  toggleSize="small"
                  centered
                  value={composerState.addConferencing}
                  onChange={composerState.setAddConferencing}
                />
              }
            >
              <StyledRowDescription>
                {t`Add a meeting link`}
              </StyledRowDescription>
            </ComposerFieldRow>
            <ComposerFieldRow
              label={t`Description`}
              labelMinWidth={COMPOSER_LABEL_MIN_WIDTH}
            >
              <TextArea
                textAreaId="calendar-event-composer-description"
                variant="transparent"
                minRows={1}
                maxRows={8}
                value={composerState.description}
                placeholder={t`Add details for guests`}
                onChange={composerState.setDescription}
              />
            </ComposerFieldRow>
          </ComposerHeader>
        </DragDropProvider>
      </DragDropItemDndContext.Provider>

      {hasNotices && (
        <StyledNoticesContainer>
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
          {composerState.hasTooManyAttendees && (
            <Callout
              variant="warning"
              title={t`Too many guests`}
              description={t`Remove some guests before creating this event.`}
            />
          )}
          {!composerState.hasTargetAssociation && (
            <Callout
              variant="warning"
              title={t`Keep this event related`}
              description={t`Keep the current record in the guest list and leave invitations on so the event remains visible on this record.`}
            />
          )}
        </StyledNoticesContainer>
      )}
    </StyledFieldsContainer>
  );
};
