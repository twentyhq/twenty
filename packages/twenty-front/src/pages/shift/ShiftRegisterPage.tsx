import { useMemo, useState } from 'react';

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { ShiftPageShell } from '@/shift/components/ShiftPageShell';
import { ShiftRegisterDayModal } from '@/shift/components/ShiftRegisterDayModal';
import { ShiftRegisterMonthCalendar } from '@/shift/components/ShiftRegisterMonthCalendar';
import { ShiftTopBar } from '@/shift/components/ShiftTopBar';
import { useShiftRegistration } from '@/shift/hooks/useShiftRegistration';
import {
  type ShiftRosterEntry,
  useShiftRoster,
} from '@/shift/hooks/useShiftRoster';
import {
  type ShiftTemplateRecord,
  useShiftTemplates,
} from '@/shift/hooks/useShiftTemplates';
import { useShiftViews } from '@/shift/hooks/useShiftViews';
import { useSpecialDays } from '@/shift/hooks/useSpecialDays';
import {
  addMonthsToMonthValue,
  buildIctMonthCalendar,
  computeSpecialDayDatesInWeek,
  getIctMonthValue,
  getIctToday,
  getMonthLabel,
  getShiftStartUtcMillis,
  getWeekdayIndex,
} from '@/shift/utils/shiftWeek';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Mon..Fri are weekday-index 0..4 and Sat/Sun 5..6, so a day's weekday index
// tells its kind.
const FIRST_WEEKEND_INDEX = 5;

const DAY_MODAL_ID = 'shift-register-day-modal';

const StyledPageBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['5']};
  overflow: auto;
  padding: ${themeCssVariables.spacing['6']};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['3']};
`;

const StyledHeaderTitle = styled.h1`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledCalendarScroll = styled.div`
  display: flex;
  flex-direction: column;
  overflow-x: auto;
`;

const StyledStateText = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  margin: auto;
`;

// A day's registrable templates. A Special Day is treated as a holiday: it
// shows ONLY its HOLIDAY_OT templates — they REPLACE the everyday roster rather
// than adding to it. An ordinary day shows its weekday/weekend templates by
// weekday index. Slots whose start time has already passed on `day` (only
// possible for today) are dropped: you can't register a shift that has begun.
const getApplicableTemplatesForDay = ({
  templates,
  day,
  weekdayIndex,
  isSpecialDay,
}: {
  templates: ShiftTemplateRecord[];
  day: string;
  weekdayIndex: number;
  isSpecialDay: boolean;
}): ShiftTemplateRecord[] => {
  const targetKind = isSpecialDay
    ? 'HOLIDAY_OT'
    : weekdayIndex < FIRST_WEEKEND_INDEX
      ? 'WEEKDAY'
      : 'WEEKEND';
  const nowMs = Date.now();

  return templates
    .filter(
      (template) =>
        template.dayKind === targetKind &&
        getShiftStartUtcMillis(day, template.startTime) > nowMs,
    )
    .sort((first, second) => first.startTime.localeCompare(second.startTime));
};

const ShiftRegisterBody = () => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { openModal } = useModal();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const today = useMemo(() => getIctToday(), []);
  const currentMonth = useMemo(() => getIctMonthValue(), []);
  const [viewedMonth, setViewedMonth] = useState(currentMonth);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const { weeks, fromDate, toDate } = useMemo(
    () => buildIctMonthCalendar(viewedMonth),
    [viewedMonth],
  );
  const monthDays = useMemo(() => weeks.flat().filter(isDefined), [weeks]);

  // The calendar is a TEAM ROSTER: the shiftRoster query bypasses the per-member
  // read scope on the server and returns every member's coverage — but only safe
  // fields (no attendance/pay). My Week and Report still use useMyShifts.
  const { roster, loading, error, refetch } = useShiftRoster({
    fromDate,
    toDate,
  });
  const { shiftTemplates, loading: templatesLoading } = useShiftTemplates();
  const { specialDays } = useSpecialDays();

  const { isRegistering, registerShiftsForDay } = useShiftRegistration({
    memberId: currentWorkspaceMember?.id,
    refetch,
  });

  const templatesById = useMemo(() => {
    const map: Record<string, ShiftTemplateRecord> = {};

    for (const template of shiftTemplates) {
      map[template.id] = template;
    }

    return map;
  }, [shiftTemplates]);

  // Whole-team roster grouped by day (the server already excludes cancelled
  // shifts, so every entry here is live coverage from some member).
  const registeredByDate = useMemo(() => {
    const map: Record<string, ShiftRosterEntry[]> = {};

    for (const entry of roster) {
      (map[entry.date] ??= []).push(entry);
    }

    // Order each day's coverage 0 → 24h so the calendar reads top-to-bottom by
    // shift start (nulls, a deactivated template, sink to the bottom).
    for (const entries of Object.values(map)) {
      entries.sort((first, second) =>
        (first.startTime ?? '99:99').localeCompare(second.startTime ?? '99:99'),
      );
    }

    return map;
  }, [roster]);

  // The current member's own registrations — their commitment. Drives the modal's
  // "already taken by me" set and the summary totals (others' coverage doesn't
  // disable a member's checkbox; the server enforces OT exclusivity).
  const myRoster = useMemo(
    () =>
      roster.filter(
        (entry) =>
          isDefined(currentWorkspaceMember?.id) &&
          entry.memberId === currentWorkspaceMember?.id,
      ),
    [roster, currentWorkspaceMember?.id],
  );

  // Which days of the viewed month are special: SPECIFIC by exact date, YEARLY
  // by month/day — mirrors the server ShiftRateWorkspaceService matching.
  const specialDayDates = useMemo(
    () => computeSpecialDayDatesInWeek({ specialDays, days: monthDays }),
    [monthDays, specialDays],
  );

  const weekdayHeaders = [
    t`Mon`,
    t`Tue`,
    t`Wed`,
    t`Thu`,
    t`Fri`,
    t`Sat`,
    t`Sun`,
  ];

  const goToPreviousMonth = () => {
    setViewedMonth((previous) => {
      const candidate = addMonthsToMonthValue(previous, -1);

      // Never register into a past month.
      return candidate < currentMonth ? currentMonth : candidate;
    });
  };

  const goToNextMonth = () => {
    setViewedMonth((previous) => addMonthsToMonthValue(previous, 1));
  };

  const handleSelectDay = (day: string) => {
    setSelectedDay(day);
    openModal(DAY_MODAL_ID);
  };

  const handleRegisterForDay = async (date: string, templateIds: string[]) => {
    const result = await registerShiftsForDay(date, templateIds);

    if (result.successCount > 0) {
      enqueueSuccessSnackBar({
        message: t`Registered ${result.successCount} shift(s).`,
      });
    }

    if (result.errors.length > 0) {
      enqueueErrorSnackBar({
        message: t`${result.errors.length} shift(s) could not be registered.`,
      });
    }

    return result;
  };

  const selectedDayTemplates = isDefined(selectedDay)
    ? getApplicableTemplatesForDay({
        templates: shiftTemplates,
        day: selectedDay,
        weekdayIndex: getWeekdayIndex(selectedDay),
        isSpecialDay: specialDayDates.has(selectedDay),
      })
    : [];

  // Only the current member's OWN registrations disable a day's checkboxes — a
  // slot another member took is still selectable here (server rejects clashes).
  const selectedDayRegisteredIds = useMemo(() => {
    if (!isDefined(selectedDay)) {
      return new Set<string>();
    }

    return new Set(
      myRoster
        .filter((entry) => entry.date === selectedDay)
        .map((entry) => entry.shiftTemplateId)
        .filter(isDefined),
    );
  }, [myRoster, selectedDay]);

  const isFirstLoad =
    (loading || templatesLoading) &&
    roster.length === 0 &&
    shiftTemplates.length === 0;

  if (isFirstLoad) {
    return (
      <StyledPageBody>
        <StyledStateText>{t`Loading…`}</StyledStateText>
      </StyledPageBody>
    );
  }

  if (isDefined(error) && roster.length === 0) {
    return (
      <StyledPageBody>
        <StyledStateText>{t`Couldn't load registration.`}</StyledStateText>
        <Button
          title={t`Retry`}
          variant="primary"
          accent="blue"
          onClick={() => {
            void refetch();
          }}
        />
      </StyledPageBody>
    );
  }

  return (
    <StyledPageBody>
      <StyledHeader>
        <Button
          Icon={IconChevronLeft}
          title={t`Previous month`}
          variant="secondary"
          onClick={goToPreviousMonth}
          disabled={viewedMonth <= currentMonth}
        />
        <StyledHeaderTitle>
          {t`Register shifts — ${getMonthLabel(viewedMonth)}`}
        </StyledHeaderTitle>
        <Button
          Icon={IconChevronRight}
          title={t`Next month`}
          variant="secondary"
          onClick={goToNextMonth}
        />
      </StyledHeader>
      <StyledCalendarScroll>
        <ShiftRegisterMonthCalendar
          weeks={weeks}
          today={today}
          weekdayHeaders={weekdayHeaders}
          registeredByDate={registeredByDate}
          templatesById={templatesById}
          currentMemberId={currentWorkspaceMember?.id}
          specialDayDates={specialDayDates}
          onSelectDay={handleSelectDay}
        />
      </StyledCalendarScroll>
      {isDefined(selectedDay) && (
        <ShiftRegisterDayModal
          modalInstanceId={DAY_MODAL_ID}
          dayLabel={`${weekdayHeaders[getWeekdayIndex(selectedDay)]} ${selectedDay}`}
          templates={selectedDayTemplates}
          registeredTemplateIds={selectedDayRegisteredIds}
          isRegistering={isRegistering}
          onRegister={(templateIds) =>
            handleRegisterForDay(selectedDay, templateIds)
          }
          onClose={() => setSelectedDay(null)}
        />
      )}
    </StyledPageBody>
  );
};

export const ShiftRegisterPage = () => {
  const { tableView } = useShiftViews();

  if (!isDefined(tableView)) {
    return null;
  }

  return (
    <ShiftPageShell viewId={tableView.id}>
      <ShiftTopBar />
      <ShiftRegisterBody />
    </ShiftPageShell>
  );
};
