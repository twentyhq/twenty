import { Fragment } from 'react';

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type ShiftRecord } from '@/shift/hooks/useMyShifts';
import { type ShiftTemplateRecord } from '@/shift/hooks/useShiftTemplates';
import {
  CHECK_OUT_DEVIATION_WARNING_MINUTES,
  getCheckOutDeviationMinutes,
  groupShiftsByWeek,
} from '@/shift/utils/shiftReport';
import {
  formatMinutesOfDay,
  formatWorkingHours,
  getIctMinutesOfDay,
  getShiftStatusTagColor,
  isShiftMissed,
} from '@/shift/utils/shiftWeek';

const StyledScroll = styled.div`
  overflow-x: auto;
  width: 100%;
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  min-width: 100%;
`;

const StyledHeadCell = styled.th`
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: ${themeCssVariables.spacing['2']} ${themeCssVariables.spacing['3']};
  text-align: left;
  white-space: nowrap;
`;

const StyledRow = styled.tr`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledCell = styled.td`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing['2']} ${themeCssVariables.spacing['3']};
  white-space: nowrap;
`;

const StyledShiftCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['2']};
`;

const StyledShiftName = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

// Same convention as ShiftWeekList: template color renders as an inverted-text
// chip; a deactivated template (no color) falls back to a neutral token chip so
// the code stays readable.
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
  padding: ${themeCssVariables.spacing['1']} ${themeCssVariables.spacing['2']};
`;

const StyledFlags = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['2']};
`;

const StyledWarningIcon = styled.span`
  align-items: center;
  color: ${themeCssVariables.color.yellow};
  display: inline-flex;
`;

// A banded row that opens each ICT week and carries that week's rolled-up totals.
const StyledWeekRow = styled.tr`
  background: ${themeCssVariables.background.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
`;

const StyledWeekCell = styled.td`
  padding: ${themeCssVariables.spacing['2']} ${themeCssVariables.spacing['3']};
`;

const StyledWeekInner = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing['4']};
  justify-content: space-between;
`;

const StyledWeekHeading = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${themeCssVariables.spacing['2']};
`;

const StyledWeekLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledWeekRange = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledWeekTotals = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing['4']};
`;

const StyledWeekTotalValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const formatInstantTime = (isoInstant: string | null): string =>
  isDefined(isoInstant)
    ? formatMinutesOfDay(getIctMinutesOfDay(new Date(isoInstant)))
    : '—';

const formatTimeWindow = (
  startTime: string | null,
  endTime: string | null,
): string =>
  isDefined(startTime) && isDefined(endTime)
    ? `${startTime} – ${endTime}`
    : '—';

type ShiftReportRowProps = {
  shift: ShiftRecord;
  template: ShiftTemplateRecord | undefined;
};

const ShiftReportRow = ({ shift, template }: ShiftReportRowProps) => {
  const { t } = useLingui();

  // An UPCOMING shift whose window has fully elapsed with no check-in reads as an
  // absence, not a still-open "Upcoming" — the same inference the stat cards count.
  const isMissed = isShiftMissed(shift);

  const statusLabel =
    shift.status === 'IN_PROGRESS'
      ? t`In progress`
      : shift.status === 'COMPLETED'
        ? t`Completed`
        : shift.status === 'CANCELLED'
          ? t`Cancelled`
          : isMissed
            ? t`Absent`
            : t`Upcoming`;
  const statusColor = isMissed
    ? 'orange'
    : getShiftStatusTagColor(shift.status);

  const chipCode = shift.templateCode ?? template?.code ?? null;
  const chipColor = template?.color ?? null;
  const shiftName = shift.templateName ?? template?.name ?? shift.name;

  const workingHours = isDefined(shift.workingMinutes)
    ? formatWorkingHours(shift.workingMinutes)
    : '—';

  const isOvertime =
    isDefined(shift.rateMultiplier) && shift.rateMultiplier > 1;
  const multiplierLabel = isDefined(shift.rateMultiplier)
    ? `×${shift.rateMultiplier}`
    : '—';

  const isLate =
    isDefined(shift.checkInLateMinutes) && shift.checkInLateMinutes >= 1;

  const deviationMinutes = getCheckOutDeviationMinutes(shift);
  const hasCheckOutWarning =
    isDefined(deviationMinutes) &&
    deviationMinutes > CHECK_OUT_DEVIATION_WARNING_MINUTES;
  const roundedDeviation = isDefined(deviationMinutes)
    ? Math.round(deviationMinutes)
    : 0;

  return (
    <StyledRow>
      <StyledCell>{shift.date}</StyledCell>
      <StyledCell>
        <StyledShiftCell>
          {isDefined(chipCode) && (
            <StyledCodeChip
              hasColor={isDefined(chipColor)}
              style={
                isDefined(chipColor)
                  ? { backgroundColor: chipColor }
                  : undefined
              }
            >
              {chipCode}
            </StyledCodeChip>
          )}
          <StyledShiftName>{shiftName}</StyledShiftName>
        </StyledShiftCell>
      </StyledCell>
      <StyledCell>
        {formatTimeWindow(shift.startTime, shift.endTime)}
      </StyledCell>
      <StyledCell>
        <Tag color={statusColor} text={statusLabel} />
      </StyledCell>
      <StyledCell>{formatInstantTime(shift.checkInAt)}</StyledCell>
      <StyledCell>{formatInstantTime(shift.checkOutAt)}</StyledCell>
      <StyledCell>{workingHours}</StyledCell>
      <StyledCell>
        {isOvertime ? (
          <Tag color="orange" text={multiplierLabel} />
        ) : (
          multiplierLabel
        )}
      </StyledCell>
      <StyledCell>
        <StyledFlags>
          {isLate && (
            <Tag color="red" text={t`Muộn +${shift.checkInLateMinutes}'`} />
          )}
          {hasCheckOutWarning && (
            <StyledWarningIcon
              title={t`Check-out is ${roundedDeviation} min off the scheduled end`}
            >
              <IconAlertTriangle size={16} />
            </StyledWarningIcon>
          )}
        </StyledFlags>
      </StyledCell>
    </StyledRow>
  );
};

type ShiftReportTableProps = {
  shifts: ShiftRecord[];
  templateById: Record<string, ShiftTemplateRecord>;
};

export const ShiftReportTable = ({
  shifts,
  templateById,
}: ShiftReportTableProps) => {
  const { t } = useLingui();

  // Number weeks chronologically (Week 1 = earliest) but display the most recent
  // week first.
  const weekGroups = groupShiftsByWeek(shifts)
    .map((group, index) => ({ ...group, weekNumber: index + 1 }))
    .reverse();

  return (
    <StyledScroll>
      <StyledTable>
        <thead>
          <tr>
            <StyledHeadCell>{t`Date`}</StyledHeadCell>
            <StyledHeadCell>{t`Shift`}</StyledHeadCell>
            <StyledHeadCell>{t`Time`}</StyledHeadCell>
            <StyledHeadCell>{t`Status`}</StyledHeadCell>
            <StyledHeadCell>{t`Check-in`}</StyledHeadCell>
            <StyledHeadCell>{t`Check-out`}</StyledHeadCell>
            <StyledHeadCell>{t`Working hours`}</StyledHeadCell>
            <StyledHeadCell>{t`Multiplier`}</StyledHeadCell>
            <StyledHeadCell>{t`Flags`}</StyledHeadCell>
          </tr>
        </thead>
        <tbody>
          {weekGroups.map((group) => (
            <Fragment key={group.weekStart}>
              <StyledWeekRow>
                <StyledWeekCell colSpan={9}>
                  <StyledWeekInner>
                    <StyledWeekHeading>
                      <StyledWeekLabel>{t`Week ${group.weekNumber}`}</StyledWeekLabel>
                      <StyledWeekRange>
                        {group.weekStart} → {group.weekEnd}
                      </StyledWeekRange>
                    </StyledWeekHeading>
                    <StyledWeekTotals>
                      <span>
                        {t`Registered`}{' '}
                        <StyledWeekTotalValue>
                          {group.registeredHours.toFixed(2)}h
                        </StyledWeekTotalValue>
                      </span>
                      <span>
                        {t`Working`}{' '}
                        <StyledWeekTotalValue>
                          {group.workingHours.toFixed(2)}h
                        </StyledWeekTotalValue>
                      </span>
                    </StyledWeekTotals>
                  </StyledWeekInner>
                </StyledWeekCell>
              </StyledWeekRow>
              {group.shifts.map((shift) => (
                <ShiftReportRow
                  key={shift.id}
                  shift={shift}
                  template={
                    isDefined(shift.shiftTemplateId)
                      ? templateById[shift.shiftTemplateId]
                      : undefined
                  }
                />
              ))}
            </Fragment>
          ))}
        </tbody>
      </StyledTable>
    </StyledScroll>
  );
};
