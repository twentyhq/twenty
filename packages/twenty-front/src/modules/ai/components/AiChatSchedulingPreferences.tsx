import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useId, useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import {
  getValidTimeZoneOrUndefined,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { FormFieldRow, SearchInput } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import {
  Button,
  Checkbox,
  Input,
  type SelectOption,
} from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { normalizeSearchText } from 'twenty-ui/utilities';

import { type AiChatSchedulingCalendar } from '@/ai/types/AiChatSchedulingCalendar';
import { type AiChatSchedulingPreferencesValue } from '@/ai/types/AiChatSchedulingPreferencesValue';
import { AVAILABLE_TIMEZONE_OPTIONS } from '@/localization/constants/AvailableTimezoneOptions';
import { findAvailableTimeZoneOption } from '@/localization/utils/findAvailableTimeZoneOption';
import { formatTimeZoneLabel } from '@/localization/utils/formatTimeZoneLabel';
import { getValidPlainTimeOrUndefined } from '@/localization/utils/getValidPlainTimeOrUndefined';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

const FIELD_LABEL_WIDTH_PX = 112;
const CALENDAR_LIST_MAX_HEIGHT_PX = 240;

const StyledFields = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow: hidden;
`;

const StyledFullWidth = styled.div`
  min-width: 0;
  width: 100%;
`;

const StyledChoices = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
  padding-block: ${themeCssVariables.spacing[2]};
`;

const StyledChoice = styled.label`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCalendarChoices = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  max-height: ${CALENDAR_LIST_MAX_HEIGHT_PX}px;
  overflow-y: auto;
  padding-block: ${themeCssVariables.spacing[2]};
`;

const StyledTimeRange = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  white-space: nowrap;
  width: 100%;
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  padding-block: ${themeCssVariables.spacing[2]};
`;

type AiChatSchedulingPreferencesProps = {
  value: AiChatSchedulingPreferencesValue;
  calendars: AiChatSchedulingCalendar[];
  onChange: (value: AiChatSchedulingPreferencesValue) => void;
  timeZoneOptions?: SelectOption<string>[];
  isDisabled?: boolean;
};

const getOrganizerCalendarDescription = (
  calendar: Pick<
    AiChatSchedulingCalendar,
    'isDisabled' | 'canOrganize' | 'description'
  >,
) => {
  if (calendar.isDisabled) {
    return t`Unavailable`;
  }

  if (!calendar.canOrganize) {
    return t`Read-only calendar`;
  }

  return calendar.description;
};

export const AiChatSchedulingPreferences = ({
  value,
  calendars,
  onChange,
  timeZoneOptions = AVAILABLE_TIMEZONE_OPTIONS,
  isDisabled = false,
}: AiChatSchedulingPreferencesProps) => {
  const instanceId = useId();
  const [calendarSearch, setCalendarSearch] = useState('');
  const workingHoursStart = getValidPlainTimeOrUndefined(
    value.workingHoursStart,
  );
  const workingHoursEnd = getValidPlainTimeOrUndefined(value.workingHoursEnd);
  const hasWorkingHours =
    isDefined(workingHoursStart) && isDefined(workingHoursEnd);
  const isWorkingHoursOrderInvalid =
    hasWorkingHours &&
    Temporal.PlainTime.compare(workingHoursStart, workingHoursEnd) >= 0;
  const hasWorkingDays = isNonEmptyArray(value.workingDays);
  const hasAvailabilityCalendar = calendars.some(
    ({ id, isDisabled: isCalendarDisabled }) =>
      !isCalendarDisabled && value.availabilityCalendarIds.includes(id),
  );
  const availableCalendarIds = new Set(
    calendars.filter((calendar) => !calendar.isDisabled).map(({ id }) => id),
  );
  const hasUnavailableSelectedCalendars = value.availabilityCalendarIds.some(
    (calendarId) => !availableCalendarIds.has(calendarId),
  );
  const normalizedCalendarSearch = normalizeSearchText(calendarSearch);
  const filteredCalendars = calendars.filter((calendar) =>
    normalizeSearchText(
      `${calendar.name} ${calendar.description ?? ''}`,
    ).includes(normalizedCalendarSearch),
  );
  const hasOrganizerCalendar = calendars.some(
    ({ id, canOrganize, isDisabled: isCalendarDisabled }) =>
      id === value.organizerCalendarId && canOrganize && !isCalendarDisabled,
  );
  const validTimeZone = getValidTimeZoneOrUndefined(value.timeZone);
  const availableTimeZone = findAvailableTimeZoneOption(value.timeZone)?.value;
  const listedTimeZoneOption = timeZoneOptions.find(
    ({ value: timeZone }) =>
      timeZone === value.timeZone || timeZone === availableTimeZone,
  );
  const unlistedTimeZoneOption =
    isDefined(validTimeZone) && !isDefined(listedTimeZoneOption)
      ? {
          value: validTimeZone,
          label: formatTimeZoneLabel({ timeZone: validTimeZone }),
        }
      : undefined;
  const workingDays: {
    value: AiChatSchedulingPreferencesValue['workingDays'][number];
    label: string;
  }[] = [
    { value: 1, label: t`Monday` },
    { value: 2, label: t`Tuesday` },
    { value: 3, label: t`Wednesday` },
    { value: 4, label: t`Thursday` },
    { value: 5, label: t`Friday` },
    { value: 6, label: t`Saturday` },
    { value: 7, label: t`Sunday` },
  ];

  return (
    <Section.Root fullWidth>
      <Section.Header
        title={t`Scheduling preferences`}
        description={t`Choose when you are available and which calendar sends invitations.`}
      />
      <StyledFields>
        <FormFieldRow label={t`Time zone`} labelWidth={FIELD_LABEL_WIDTH_PX}>
          <StyledFullWidth>
            <Select
              dropdownId={`${instanceId}-time-zone`}
              dropdownWidth={GenericDropdownContentWidth.ExtraExtraLarge}
              fullWidth
              value={listedTimeZoneOption?.value ?? value.timeZone}
              options={timeZoneOptions}
              pinnedOption={unlistedTimeZoneOption}
              emptyOption={{ value: '', label: t`Choose a time zone` }}
              disabled={isDisabled}
              onChange={(timeZone) => onChange({ ...value, timeZone })}
              withSearchInput
              needIconCheck
            />
            {!isDefined(validTimeZone) && (
              <StyledError role="alert">{t`Choose a time zone.`}</StyledError>
            )}
          </StyledFullWidth>
        </FormFieldRow>
        <FormFieldRow label={t`Working days`} labelWidth={FIELD_LABEL_WIDTH_PX}>
          <StyledFullWidth>
            <StyledChoices>
              {workingDays.map(({ value: day, label }) => (
                <StyledChoice key={day}>
                  <Checkbox
                    checked={value.workingDays.includes(day)}
                    disabled={isDisabled}
                    onCheckedChange={(isChecked) =>
                      onChange({
                        ...value,
                        workingDays: isChecked
                          ? [...value.workingDays, day].sort()
                          : value.workingDays.filter(
                              (workingDay) => workingDay !== day,
                            ),
                      })
                    }
                  />
                  <Text render={<span />}>{label}</Text>
                </StyledChoice>
              ))}
            </StyledChoices>
            {!hasWorkingDays && (
              <StyledError role="alert">{t`Select at least one working day.`}</StyledError>
            )}
          </StyledFullWidth>
        </FormFieldRow>
        <FormFieldRow
          label={t`Working hours`}
          labelWidth={FIELD_LABEL_WIDTH_PX}
        >
          <StyledFullWidth>
            <StyledTimeRange>
              <Input
                type="time"
                aria-label={t`Working hours start`}
                aria-invalid={
                  !isDefined(workingHoursStart) || isWorkingHoursOrderInvalid
                }
                value={value.workingHoursStart}
                disabled={isDisabled}
                onValueChange={(workingHoursStart) =>
                  onChange({ ...value, workingHoursStart })
                }
              />
              <Text render={<span />} color="tertiary">{t`to`}</Text>
              <Input
                type="time"
                aria-label={t`Working hours end`}
                aria-invalid={
                  !isDefined(workingHoursEnd) || isWorkingHoursOrderInvalid
                }
                value={value.workingHoursEnd}
                disabled={isDisabled}
                onValueChange={(workingHoursEnd) =>
                  onChange({ ...value, workingHoursEnd })
                }
              />
            </StyledTimeRange>
            {!hasWorkingHours && (
              <StyledError role="alert">{t`Enter a start and end time.`}</StyledError>
            )}
            {isWorkingHoursOrderInvalid && (
              <StyledError role="alert">{t`End time must be after start time.`}</StyledError>
            )}
          </StyledFullWidth>
        </FormFieldRow>
        <FormFieldRow
          label={t`Availability calendars`}
          labelWidth={FIELD_LABEL_WIDTH_PX}
        >
          <StyledFullWidth>
            {isNonEmptyArray(calendars) && (
              <SearchInput
                type="search"
                aria-label={t`Search availability calendars`}
                placeholder={t`Search calendars`}
                value={calendarSearch}
                onValueChange={setCalendarSearch}
                disabled={isDisabled}
              />
            )}
            <StyledCalendarChoices>
              {filteredCalendars.map((calendar) => (
                <StyledChoice key={calendar.id}>
                  <Checkbox
                    checked={value.availabilityCalendarIds.includes(
                      calendar.id,
                    )}
                    disabled={isDisabled || calendar.isDisabled}
                    onCheckedChange={(isChecked) =>
                      onChange({
                        ...value,
                        availabilityCalendarIds: isChecked
                          ? [...value.availabilityCalendarIds, calendar.id]
                          : value.availabilityCalendarIds.filter(
                              (calendarId) => calendarId !== calendar.id,
                            ),
                      })
                    }
                  />
                  <div>
                    <Text>{calendar.name}</Text>
                    <Text size="sm" color="tertiary">
                      {calendar.isDisabled
                        ? t`Unavailable`
                        : calendar.description}
                    </Text>
                  </div>
                </StyledChoice>
              ))}
              {!isNonEmptyArray(filteredCalendars) && (
                <Text color="tertiary">
                  {isNonEmptyArray(calendars)
                    ? t`No calendars match your search.`
                    : t`No calendars available.`}
                </Text>
              )}
            </StyledCalendarChoices>
            {hasUnavailableSelectedCalendars && (
              <>
                <StyledError role="alert">{t`Some selected calendars are no longer available.`}</StyledError>
                <Button
                  variant="link"
                  size="sm"
                  disabled={isDisabled}
                  onClick={() =>
                    onChange({
                      ...value,
                      availabilityCalendarIds:
                        value.availabilityCalendarIds.filter((calendarId) =>
                          availableCalendarIds.has(calendarId),
                        ),
                    })
                  }
                >
                  {t`Remove unavailable calendars`}
                </Button>
              </>
            )}
            {!hasAvailabilityCalendar && (
              <StyledError role="alert">{t`Select at least one available calendar to check for conflicts.`}</StyledError>
            )}
          </StyledFullWidth>
        </FormFieldRow>
        <FormFieldRow
          label={t`Organizer`}
          labelWidth={FIELD_LABEL_WIDTH_PX}
          hasDivider={false}
        >
          <StyledFullWidth>
            <Select
              dropdownId={`${instanceId}-organizer`}
              dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
              fullWidth
              value={value.organizerCalendarId}
              options={calendars.map((calendar) => ({
                value: calendar.id,
                label: calendar.name,
                contextualText: getOrganizerCalendarDescription(calendar),
                disabled: calendar.isDisabled || !calendar.canOrganize,
              }))}
              emptyOption={{
                value: '',
                label: t`Choose an organizer calendar`,
              }}
              disabled={isDisabled || !isNonEmptyArray(calendars)}
              onChange={(organizerCalendarId) =>
                onChange({ ...value, organizerCalendarId })
              }
              withSearchInput
              needIconCheck
            />
            {!hasOrganizerCalendar && (
              <StyledError role="alert">{t`Choose an available calendar that can send invitations.`}</StyledError>
            )}
          </StyledFullWidth>
        </FormFieldRow>
      </StyledFields>
    </Section.Root>
  );
};
