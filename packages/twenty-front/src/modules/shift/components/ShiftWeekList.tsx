import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';
import { IconDotsVertical } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { LightIconButton } from 'twenty-ui/components';
import { MenuItem, UndecoratedLink } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CancelShiftModal } from '@/shift/components/CancelShiftModal';
import { type ShiftRecord } from '@/shift/hooks/useMyShifts';
import { type ShiftTemplateRecord } from '@/shift/hooks/useShiftTemplates';
import {
  getShiftStatusTagColor,
  getWeekdayIndex,
  hasShiftWindowEnded,
  isCheckInWindowOpen,
  isShiftMissed,
} from '@/shift/utils/shiftWeek';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useModal } from '@/ui/layout/modal/hooks/useModal';

// One bordered card of the week's still-actionable shifts. Completed / past /
// cancelled shifts are deliberately absent — those live in the Report tab; this
// list is only what the member can still act on (check in, or cancel).
const StyledList = styled.section`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledHeader = styled.header`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: ${themeCssVariables.spacing['2']} ${themeCssVariables.spacing['3']};
`;

const StyledDayRow = styled.div<{ isToday: boolean }>`
  align-items: flex-start;
  background: ${({ isToday }) =>
    isToday ? themeCssVariables.background.transparent.blue : 'transparent'};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing['3']};
  padding: ${themeCssVariables.spacing['2']} ${themeCssVariables.spacing['3']};
`;

const StyledDayLabel = styled.span<{ isToday: boolean }>`
  color: ${({ isToday }) =>
    isToday
      ? themeCssVariables.color.blue
      : themeCssVariables.font.color.primary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding-top: 3px;
  width: 96px;
`;

const StyledDayShifts = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['2']};
  min-width: 0;
`;

const StyledEmpty = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing['3']};
  padding: ${themeCssVariables.spacing['6']} ${themeCssVariables.spacing['4']};
  text-align: center;
`;

const StyledShiftLine = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing['2']};
`;

const StyledTimeWindow = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

// Colored template chip; falls back to a neutral token background when the
// template was deactivated so the code stays readable instead of light-on-nothing.
const StyledCodeChip = styled.span<{ hasColor: boolean }>`
  background-color: ${({ hasColor }) =>
    hasColor ? 'transparent' : themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ hasColor }) =>
    hasColor
      ? themeCssVariables.font.color.inverted
      : themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: 0 ${themeCssVariables.spacing['1']};
`;

const StyledSpacer = styled.div`
  flex: 1;
`;

const formatTimeWindow = (
  startTime: string | null,
  endTime: string | null,
): string | null => {
  if (!isDefined(startTime) || !isDefined(endTime)) {
    return null;
  }

  return `${startTime} – ${endTime}`;
};

type WeekShiftRowProps = {
  shift: ShiftRecord;
  template: ShiftTemplateRecord | undefined;
  onCancel: (
    shiftId: string,
    reason: string,
    category: string,
  ) => Promise<void>;
};

const WeekShiftRow = ({ shift, template, onCancel }: WeekShiftRowProps) => {
  const { t } = useLingui();
  const { openModal } = useModal();
  const { closeDropdown } = useCloseDropdown();

  const dropdownId = `shift-week-menu-${shift.id}`;
  const cancelModalId = `shift-cancel-modal-${shift.id}`;

  // A shift whose scheduled window has fully elapsed can no longer be cancelled —
  // a past shift is settled (worked, missed, or to be adjusted by a leader), not
  // something a member cancels ahead of time.
  const isPast = hasShiftWindowEnded(
    shift.date,
    shift.startTime,
    shift.endTime,
  );
  const isCancellable =
    (shift.status === 'UPCOMING' || shift.status === 'IN_PROGRESS') && !isPast;

  // A not-yet-checked-in UPCOMING shift reads differently by clock: window open
  // now → action is due ("Awaiting check-in"); otherwise → still ahead
  // ("Upcoming"). (Missed/past shifts never reach this list.)
  const isAwaitingCheckIn =
    shift.status === 'UPCOMING' &&
    !isShiftMissed(shift) &&
    isCheckInWindowOpen({
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      earlyCheckInMinutes: template?.earlyCheckInMinutes ?? null,
    });

  const statusLabel =
    shift.status === 'IN_PROGRESS'
      ? t`In progress`
      : isAwaitingCheckIn
        ? t`Awaiting check-in`
        : t`Upcoming`;
  const statusColor = isAwaitingCheckIn
    ? 'yellow'
    : getShiftStatusTagColor(shift.status);

  const timeWindow = formatTimeWindow(shift.startTime, shift.endTime);
  const chipCode = shift.templateCode ?? template?.code ?? null;
  const chipColor = template?.color ?? null;
  const showOvertime =
    isDefined(shift.rateMultiplier) && shift.rateMultiplier > 1;

  const handleCancelClick = () => {
    closeDropdown(dropdownId);
    openModal(cancelModalId);
  };

  return (
    <StyledShiftLine>
      {isDefined(timeWindow) && (
        <StyledTimeWindow>{timeWindow}</StyledTimeWindow>
      )}
      {isDefined(chipCode) && (
        <StyledCodeChip
          hasColor={isDefined(chipColor)}
          style={
            isDefined(chipColor) ? { backgroundColor: chipColor } : undefined
          }
        >
          {chipCode}
        </StyledCodeChip>
      )}
      <Tag color={statusColor} text={statusLabel} />
      {showOvertime && <Tag color="orange" text={`×${shift.rateMultiplier}`} />}
      <StyledSpacer />
      {isCancellable && (
        <Dropdown
          dropdownId={dropdownId}
          dropdownPlacement="bottom-end"
          clickableComponent={
            <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
          }
          dropdownComponents={
            <DropdownContent>
              <DropdownMenuItemsContainer>
                <MenuItem
                  text={t`Cancel shift…`}
                  accent="danger"
                  onClick={handleCancelClick}
                />
              </DropdownMenuItemsContainer>
            </DropdownContent>
          }
        />
      )}
      {isCancellable && (
        <CancelShiftModal
          modalInstanceId={cancelModalId}
          shiftName={shift.name}
          isInProgress={shift.status === 'IN_PROGRESS'}
          onConfirm={(reason, category) => onCancel(shift.id, reason, category)}
        />
      )}
    </StyledShiftLine>
  );
};

type ShiftWeekListProps = {
  // Already filtered to still-actionable shifts and ordered by day then start.
  shifts: ShiftRecord[];
  today: string;
  weekdayLabels: string[];
  templateById: Record<string, ShiftTemplateRecord>;
  onCancel: (
    shiftId: string,
    reason: string,
    category: string,
  ) => Promise<void>;
};

// Collapse the (already day-then-start ordered) shifts into one group per day so
// a day with several shifts shows its date label once.
const groupShiftsByDay = (
  shifts: ShiftRecord[],
): { date: string; shifts: ShiftRecord[] }[] => {
  const groups: { date: string; shifts: ShiftRecord[] }[] = [];

  for (const shift of shifts) {
    const lastGroup = groups[groups.length - 1];

    if (isDefined(lastGroup) && lastGroup.date === shift.date) {
      lastGroup.shifts.push(shift);
    } else {
      groups.push({ date: shift.date, shifts: [shift] });
    }
  }

  return groups;
};

export const ShiftWeekList = ({
  shifts,
  today,
  weekdayLabels,
  templateById,
  onCancel,
}: ShiftWeekListProps) => {
  const { t } = useLingui();

  // Only today reads as "Today"; every other day shows its weekday + date.
  const formatDayLabel = (date: string): string =>
    date === today
      ? t`Today`
      : `${weekdayLabels[getWeekdayIndex(date)]} ${date.slice(5)}`;

  return (
    <StyledList>
      <StyledHeader>{t`Upcoming shifts`}</StyledHeader>
      {shifts.length === 0 ? (
        <StyledEmpty>
          <span>{t`No upcoming shifts.`}</span>
          <UndecoratedLink to={AppPath.ShiftRegisterPage}>
            <Button title={t`Register shifts`} variant="secondary" />
          </UndecoratedLink>
        </StyledEmpty>
      ) : (
        groupShiftsByDay(shifts).map((group) => (
          <StyledDayRow key={group.date} isToday={group.date === today}>
            <StyledDayLabel isToday={group.date === today}>
              {formatDayLabel(group.date)}
            </StyledDayLabel>
            <StyledDayShifts>
              {group.shifts.map((shift) => (
                <WeekShiftRow
                  key={shift.id}
                  shift={shift}
                  template={
                    isDefined(shift.shiftTemplateId)
                      ? templateById[shift.shiftTemplateId]
                      : undefined
                  }
                  onCancel={onCancel}
                />
              ))}
            </StyledDayShifts>
          </StyledDayRow>
        ))
      )}
    </StyledList>
  );
};
