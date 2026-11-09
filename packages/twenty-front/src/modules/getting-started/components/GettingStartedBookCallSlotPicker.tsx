import { GettingStartedBookCallDaySlots } from '@/getting-started/components/GettingStartedBookCallDaySlots';
import { GettingStartedBookCallMonthCalendar } from '@/getting-started/components/GettingStartedBookCallMonthCalendar';
import { GettingStartedBookCallTimeZoneSelect } from '@/getting-started/components/GettingStartedBookCallTimeZoneSelect';
import { StyledGettingStartedBookCallBody } from '@/getting-started/components/StyledGettingStartedBookCallBody';
import { useGettingStartedBookCallSlots } from '@/getting-started/hooks/useGettingStartedBookCallSlots';
import { type CalSlot } from '@/getting-started/types/CalSlot';
import { type TimeFormat } from '@/localization/constants/TimeFormat';
import { useRecordCalendarDaysRange } from '@/object-record/record-calendar/hooks/useRecordCalendarDaysRange';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Skeleton } from 'twenty-ui/primitives/feedback';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

const SKELETON_SLOT_COUNT = 6;

const StyledPanel = styled(StyledGettingStartedBookCallBody)`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 248px;
`;

const StyledCalendarColumn = styled.div`
  padding: ${themeCssVariables.spacing[4]};
`;

// The calendar sets the row height; only the times scroll within it.
const StyledSlotsColumn = styled.div`
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  position: relative;
`;

const StyledSlotsPanel = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  inset: 0;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[4]} 0;
  position: absolute;
`;

const StyledSkeletons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

type GettingStartedBookCallSlotPickerProps = {
  calendarBookingPageId: string;
  timeZone: string;
  onTimeZoneChange: (timeZone: string) => void;
  timeFormat: TimeFormat;
  onTimeFormatChange: (timeFormat: TimeFormat) => void;
  onSelectSlot: (slot: CalSlot) => void;
};

export const GettingStartedBookCallSlotPicker = ({
  calendarBookingPageId,
  timeZone,
  onTimeZoneChange,
  timeFormat,
  onTimeFormatChange,
  onSelectSlot,
}: GettingStartedBookCallSlotPickerProps) => {
  const { t } = useLingui();
  const today = Temporal.Now.plainDateISO(timeZone);
  const [displayedMonth, setDisplayedMonth] = useState(() =>
    today.with({ day: 1 }),
  );
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const { days: weeks, weekDayLabels } = useRecordCalendarDaysRange(
    displayedMonth,
    ViewCalendarLayout.MONTH,
  );

  const isCurrentMonth =
    Temporal.PlainDate.compare(displayedMonth, today.with({ day: 1 })) <= 0;
  const { slotsByDay, hasLoadingFailed, retry } =
    useGettingStartedBookCallSlots({
      calendarBookingPageId,
      timeZone,
      startDate: (isCurrentMonth ? today : displayedMonth).toString(),
      endDate: displayedMonth
        .add({ months: 1 })
        .subtract({ days: 1 })
        .toString(),
    });

  const availableDayKeys = Object.entries(slotsByDay ?? {})
    .filter(([, slots]) => isNonEmptyArray(slots))
    .map(([dayKey]) => dayKey)
    .sort();
  const activeDayKey =
    availableDayKeys.find((dayKey) => dayKey === selectedDayKey) ??
    availableDayKeys.at(0) ??
    null;

  const showMonth = (monthOffset: number) => {
    setDisplayedMonth(displayedMonth.add({ months: monthOffset }));
    setSelectedDayKey(null);
  };

  const renderSlotsColumnContent = () => {
    if (hasLoadingFailed) {
      return (
        <InlineBanner
          role="alert"
          status="error"
          layout="compact"
          action={
            <InlineBanner.Action onClick={retry}>
              {t`Try again`}
            </InlineBanner.Action>
          }
        >
          {t`We couldn't load the available times.`}
        </InlineBanner>
      );
    }

    if (slotsByDay === null) {
      return (
        <StyledSkeletons>
          {Array.from({ length: SKELETON_SLOT_COUNT }, (_, index) => (
            <Skeleton key={index} height={32} />
          ))}
        </StyledSkeletons>
      );
    }

    if (activeDayKey === null) {
      return (
        <Text size="sm" color="secondary">
          {t`No times available this month.`}
        </Text>
      );
    }

    return (
      <GettingStartedBookCallDaySlots
        slots={slotsByDay[activeDayKey] ?? []}
        timeZone={timeZone}
        timeFormat={timeFormat}
        onTimeFormatChange={onTimeFormatChange}
        onSelectSlot={onSelectSlot}
      />
    );
  };

  return (
    <StyledPanel>
      <StyledCalendarColumn>
        <GettingStartedBookCallMonthCalendar
          displayedMonth={displayedMonth}
          weeks={weeks}
          weekDayLabels={weekDayLabels}
          availableDayKeys={availableDayKeys}
          selectedDayKey={activeDayKey}
          todayKey={today.toString()}
          canGoToPreviousMonth={!isCurrentMonth}
          onPreviousMonth={() => showMonth(-1)}
          onNextMonth={() => showMonth(1)}
          onSelectDay={setSelectedDayKey}
        />
      </StyledCalendarColumn>
      <StyledSlotsColumn>
        <StyledSlotsPanel>
          <GettingStartedBookCallTimeZoneSelect
            timeZone={timeZone}
            onTimeZoneChange={onTimeZoneChange}
          />
          {renderSlotsColumnContent()}
        </StyledSlotsPanel>
      </StyledSlotsColumn>
    </StyledPanel>
  );
};
