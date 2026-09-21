import { type ErrorLike } from '@apollo/client';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useMemo } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { ShiftPageShell } from '@/shift/components/ShiftPageShell';
import { ShiftTodayAction } from '@/shift/components/ShiftTodayAction';
import { ShiftTopBar } from '@/shift/components/ShiftTopBar';
import { ShiftWeekList } from '@/shift/components/ShiftWeekList';
import { useMyShifts } from '@/shift/hooks/useMyShifts';
import { useShiftAttendance } from '@/shift/hooks/useShiftAttendance';
import { useShiftHandovers } from '@/shift/hooks/useShiftHandovers';
import { useShiftTemplates } from '@/shift/hooks/useShiftTemplates';
import { useShiftViews } from '@/shift/hooks/useShiftViews';
import {
  addDaysToIsoDate,
  getIctToday,
  getIctWeekRange,
  isShiftMissed,
  pickPrecedingHandover,
} from '@/shift/utils/shiftWeek';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledPageBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['6']};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing['6']};
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['4']};
  margin: auto;
  text-align: center;
`;

const StyledEmptyText = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.lg};
  margin: 0;
`;

const StyledColumns = styled.div`
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing['6']};
  min-height: 0;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const StyledLeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing['4']};
  width: 360px;

  @media (max-width: 900px) {
    width: 100%;
  }
`;

const StyledRightColumn = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['4']};
`;

const fillSkeleton = css`
  display: block;
  width: 100%;
`;

const ShiftLoadingSkeleton = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <SkeletonTheme
      baseColor={theme.grayScale.gray3}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={8}
    >
      <StyledSkeletonContainer>
        <Skeleton containerClassName={fillSkeleton} height={96} />
        <Skeleton containerClassName={fillSkeleton} height={64} count={5} />
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};

const ShiftMyWeekBody = () => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  // "Now" is captured once so the range stays stable across renders; `today` (for
  // the highlight) is the real current ICT day.
  const nowMs = useMemo(() => Date.now(), []);
  const today = useMemo(() => getIctToday(new Date(nowMs)), [nowMs]);

  // The window spans this ICT week plus the whole of next week, so a member always
  // sees what they've registered for both weeks without any navigation.
  const { fromDate, toDate } = useMemo(() => {
    const thisWeek = getIctWeekRange(new Date(nowMs));

    return {
      fromDate: thisWeek.fromDate,
      toDate: addDaysToIsoDate(thisWeek.toDate, 7),
    };
  }, [nowMs]);

  const { shifts, loading, error, refetch } = useMyShifts({
    memberId: currentWorkspaceMember?.id,
    fromDate,
    toDate,
  });
  // Team handover notes for the viewed week — used to surface the note left by
  // whoever worked the shift immediately before the member's current/next shift.
  const { handovers } = useShiftHandovers({ fromDate, toDate });
  const { shiftTemplates } = useShiftTemplates();
  const { checkInShift, checkOutShift, cancelShift } = useShiftAttendance();

  const templateById = useMemo(() => {
    const map: Record<string, (typeof shiftTemplates)[number]> = {};

    for (const template of shiftTemplates) {
      map[template.id] = template;
    }

    return map;
  }, [shiftTemplates]);

  // The right column is a "what's left to act on" list: in-progress shifts and
  // still-upcoming shifts that haven't passed. Completed / cancelled / missed
  // shifts drop out (they live in the Report tab). Ordered by day then start time.
  const upcomingShifts = useMemo(
    () =>
      [...shifts]
        .filter(
          (shift) =>
            shift.status === 'IN_PROGRESS' ||
            (shift.status === 'UPCOMING' && !isShiftMissed(shift)),
        )
        .sort((first, second) =>
          first.date === second.date
            ? (first.startTime ?? '').localeCompare(second.startTime ?? '')
            : first.date.localeCompare(second.date),
        ),
    [shifts],
  );

  // The shift the action card focuses on: an in-progress shift (to check out),
  // otherwise the earliest still-upcoming shift that hasn't already passed (to
  // check in). A missed shift — UPCOMING but its window has fully elapsed with no
  // check-in — is skipped here so it never surfaces as "Up next" with a stale
  // check-in button. Null when the week has nothing left to act on.
  const actionableShift = useMemo(() => {
    const inProgress = shifts.find((shift) => shift.status === 'IN_PROGRESS');

    if (isDefined(inProgress)) {
      return inProgress;
    }

    return (
      [...shifts]
        .filter((shift) => shift.status === 'UPCOMING' && !isShiftMissed(shift))
        .sort((first, second) =>
          first.date === second.date
            ? (first.startTime ?? '').localeCompare(second.startTime ?? '')
            : first.date.localeCompare(second.date),
        )[0] ?? null
    );
  }, [shifts]);

  const actionableTemplate = isDefined(actionableShift?.shiftTemplateId)
    ? templateById[actionableShift.shiftTemplateId]
    : undefined;

  const previousHandover = useMemo(
    () =>
      isDefined(actionableShift)
        ? pickPrecedingHandover({ shift: actionableShift, handovers })
        : null,
    [actionableShift, handovers],
  );

  const weekdayLabels = [
    t`Mon`,
    t`Tue`,
    t`Wed`,
    t`Thu`,
    t`Fri`,
    t`Sat`,
    t`Sun`,
  ];

  const handleCheckIn = async (shiftId: string) => {
    try {
      await checkInShift(shiftId);
      await refetch();
      enqueueSuccessSnackBar({ message: t`Checked in.` });
    } catch (error) {
      enqueueErrorSnackBar({ apolloError: error as ErrorLike });
    }
  };

  const handleCheckOut = async (
    shiftId: string,
    handoverNote: string | null,
  ) => {
    try {
      await checkOutShift(shiftId, handoverNote);
      await refetch();
      enqueueSuccessSnackBar({ message: t`Checked out.` });
    } catch (error) {
      enqueueErrorSnackBar({ apolloError: error as ErrorLike });
      // Rethrow so the modal keeps the typed handover note instead of clearing it.
      throw error;
    }
  };

  const handleCancel = async (
    shiftId: string,
    reason: string,
    category: string,
  ) => {
    try {
      await cancelShift(shiftId, reason, category);
      await refetch();
      enqueueSuccessSnackBar({ message: t`Shift cancelled.` });
    } catch (error) {
      enqueueErrorSnackBar({ apolloError: error as ErrorLike });
      // Rethrow so the modal keeps the typed reason/category instead of clearing it.
      throw error;
    }
  };

  const renderContent = () => {
    if (loading && shifts.length === 0) {
      return <ShiftLoadingSkeleton />;
    }

    // A failed load shows retry; only a genuine empty week shows the register CTA.
    if (shifts.length === 0) {
      if (isDefined(error)) {
        return (
          <StyledEmptyState>
            <StyledEmptyText>{t`Couldn't load your shifts.`}</StyledEmptyText>
            <Button
              title={t`Retry`}
              variant="primary"
              accent="blue"
              onClick={() => {
                void refetch();
              }}
            />
          </StyledEmptyState>
        );
      }

      return (
        <StyledEmptyState>
          <StyledEmptyText>{t`No shifts registered for this week or next.`}</StyledEmptyText>
          <UndecoratedLink to={AppPath.ShiftRegisterPage}>
            <Button
              title={t`Register shifts`}
              variant="primary"
              accent="blue"
            />
          </UndecoratedLink>
        </StyledEmptyState>
      );
    }

    return (
      <StyledColumns>
        <StyledLeftColumn>
          <ShiftTodayAction
            shift={actionableShift}
            template={actionableTemplate}
            previousHandover={previousHandover}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        </StyledLeftColumn>
        <StyledRightColumn>
          <ShiftWeekList
            shifts={upcomingShifts}
            today={today}
            weekdayLabels={weekdayLabels}
            templateById={templateById}
            onCancel={handleCancel}
          />
        </StyledRightColumn>
      </StyledColumns>
    );
  };

  return <StyledPageBody>{renderContent()}</StyledPageBody>;
};

export const ShiftPage = () => {
  const { tableView } = useShiftViews();

  if (!isDefined(tableView)) {
    return null;
  }

  return (
    <ShiftPageShell viewId={tableView.id}>
      <ShiftTopBar />
      <ShiftMyWeekBody />
    </ShiftPageShell>
  );
};
