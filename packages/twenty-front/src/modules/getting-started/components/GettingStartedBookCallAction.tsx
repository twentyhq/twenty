import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { GettingStartedBookCallSummary } from '@/getting-started/components/GettingStartedBookCallSummary';
import { GETTING_STARTED_BOOK_CALL_CALENDAR_MIN_VIEWPORT_HEIGHT } from '@/getting-started/constants/GettingStartedBookCallCalendarMinViewportHeight';
import { GettingStartedBookCallSlotsLoadEffect } from '@/getting-started/effect-components/GettingStartedBookCallSlotsLoadEffect';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { gettingStartedBookCallSlotsByDayState } from '@/getting-started/states/gettingStartedBookCallSlotsByDayState';
import { getBookCallAvailability } from '@/getting-started/utils/getBookCallAvailability';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { getDatePickerWeekdayLabels } from '@/localization/utils/getDatePickerWeekdayLabels';
import { BookCallStepBody } from '@/onboarding/components/BookCallStepBody';
import { BookCallBookingSuccessEffect } from '@/onboarding/effect-components/BookCallBookingSuccessEffect';
import { getDatePickerWeekStartOrThrow } from '@/ui/input/components/internal/date/utils/getDatePickerWeekStartOrThrow';
import { useFullScreenModal } from '@/ui/layout/fullscreen/hooks/useFullScreenModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { DatePicker } from 'twenty-ui/components/input';
import { IconArrowRight } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';

const StyledPreview = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  overflow: hidden;

  @media (max-width: ${MOBILE_VIEWPORT}px),
    (max-height: ${GETTING_STARTED_BOOK_CALL_CALENDAR_MIN_VIEWPORT_HEIGHT}px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const StyledInfoColumn = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-right: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    border-bottom: 1px solid ${themeCssVariables.border.color.light};
    border-right: none;
  }

  @media (max-height: ${GETTING_STARTED_BOOK_CALL_CALENDAR_MIN_VIEWPORT_HEIGHT}px) {
    align-items: flex-end;
    border: none;
    flex-direction: row;
  }
`;

const StyledPickATime = styled.div`
  flex-shrink: 0;
`;

const StyledCalendarColumn = styled.div`
  background: ${themeCssVariables.background.primary};
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[4]};

  @media (max-height: ${GETTING_STARTED_BOOK_CALL_CALENDAR_MIN_VIEWPORT_HEIGHT}px) {
    display: none;
  }
`;

const StyledBookingPage = styled.div`
  align-items: center;
  gap: ${themeCssVariables.spacing[5]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[8]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]};
  }
`;

type BookingPage = { dayKey?: string };

export const GettingStartedBookCallAction = () => {
  const { t, i18n } = useLingui();
  const calendarBookingPageId = useAtomStateValue(calendarBookingPageIdState);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const gettingStartedBookCallSlotsByDay = useAtomStateValue(
    gettingStartedBookCallSlotsByDayState,
  );
  const { timeZone } = useDateTimeFormat();
  const { updateGettingStarted } = useUpdateGettingStarted();
  const [openedBookingPage, setOpenedBookingPage] =
    useState<BookingPage | null>(null);
  const [navigatedMonth, setNavigatedMonth] = useState<string | null>(null);

  const { renderFullScreenModal } = useFullScreenModal({
    links: [{ children: t`Getting started` }, { children: t`Book a call` }],
    onClose: () => setOpenedBookingPage(null),
  });

  const { availableDayKeys } = getBookCallAvailability(
    gettingStartedBookCallSlotsByDay,
  );
  const todayKey = Temporal.Now.plainDateISO(timeZone).toString();
  const viewedMonth =
    navigatedMonth ?? (availableDayKeys.at(0) ?? todayKey).slice(0, 7);

  const handleBookingSuccessful = () => {
    setOpenedBookingPage(null);
    void updateGettingStarted({
      completedStepActionKey: GettingStartedStepActionKey.BOOK_CALL,
    });
  };

  if (!isNonEmptyString(calendarBookingPageId)) {
    return null;
  }

  return (
    <>
      <GettingStartedBookCallSlotsLoadEffect
        calendarBookingPageId={calendarBookingPageId}
        timeZone={timeZone}
      />
      <StyledPreview>
        <StyledInfoColumn>
          <GettingStartedBookCallSummary />
          <StyledPickATime>
            <Button
              variant="solid"
              color="accent"
              fullWidth
              endIcon={<IconArrowRight />}
              onClick={() => setOpenedBookingPage({})}
            >
              {t`Pick a time`}
            </Button>
          </StyledPickATime>
        </StyledInfoColumn>
        <StyledCalendarColumn>
          <DatePicker
            aria-label={t`Choose a date`}
            value={null}
            onValueChange={(dayKey) => setOpenedBookingPage({ dayKey })}
            viewedMonth={viewedMonth}
            onViewedMonthChange={setNavigatedMonth}
            weekStart={getDatePickerWeekStartOrThrow(
              currentWorkspaceMember?.calendarStartDay,
            )}
            locale={i18n.locale}
            weekdayLabels={getDatePickerWeekdayLabels(i18n.locale)}
            previousMonthLabel={t`Previous month`}
            nextMonthLabel={t`Next month`}
            monthLabel={t`Month`}
            yearLabel={t`Year`}
            isDateUnavailable={(date) => !availableDayKeys.includes(date)}
          />
        </StyledCalendarColumn>
      </StyledPreview>
      {renderFullScreenModal(
        <StyledBookingPage>
          <BookCallBookingSuccessEffect
            onBookingSuccessful={handleBookingSuccessful}
          />
          <BookCallStepBody
            calendarBookingPageId={calendarBookingPageId}
            date={openedBookingPage?.dayKey}
          />
        </StyledBookingPage>,
        isDefined(openedBookingPage),
      )}
    </>
  );
};
