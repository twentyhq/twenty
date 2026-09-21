import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CheckOutModal } from '@/shift/components/CheckOutModal';
import { type ShiftHandoverEntry } from '@/shift/hooks/useShiftHandovers';
import { type ShiftRecord } from '@/shift/hooks/useMyShifts';
import { type ShiftTemplateRecord } from '@/shift/hooks/useShiftTemplates';
import {
  getCheckInOpensAtLabel,
  getShiftStatusTagColor,
  isCheckInWindowOpen,
} from '@/shift/utils/shiftWeek';
import { useModal } from '@/ui/layout/modal/hooks/useModal';

const StyledCard = styled.section`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['3']};
  padding: ${themeCssVariables.spacing['4']};
`;

const StyledHeading = styled.h2`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.04em;
  margin: 0;
  text-transform: uppercase;
`;

const StyledEmpty = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  margin: 0;
`;

const StyledShiftInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['1']};
`;

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['2']};
`;

const StyledShiftName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledTimeWindow = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledTimer = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-feature-settings: 'tnum';
  font-size: 32px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.02em;
`;

const StyledTimerLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  text-transform: uppercase;
`;

const StyledActionAnchor = styled.span`
  display: block;
  width: 100%;
`;

const StyledHandover = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['1']};
  padding-top: ${themeCssVariables.spacing['3']};
`;

const StyledHandoverLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const StyledHandoverNote = styled.p`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledHandoverMeta = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const formatHandoverMeta = (handover: ShiftHandoverEntry): string =>
  [
    handover.templateCode,
    handover.memberName,
    isDefined(handover.startTime) && isDefined(handover.endTime)
      ? `${handover.startTime} – ${handover.endTime}`
      : null,
  ]
    .filter(isDefined)
    .join(' · ');

const formatTimeWindow = (
  startTime: string | null,
  endTime: string | null,
): string | null => {
  if (!isDefined(startTime) || !isDefined(endTime)) {
    return null;
  }

  return `${startTime} – ${endTime}`;
};

const formatElapsed = (elapsedSeconds: number): string => {
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
};

// Live elapsed time since check-in, ticking every second — a running clock that
// tells the member how long they've been on shift.
const ShiftElapsedTimer = ({ checkInAt }: { checkInAt: string }) => {
  const { t } = useLingui();
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => setNowMs(Date.now()), 1000);

    return () => clearInterval(intervalId);
  }, []);

  const elapsedSeconds = Math.max(
    0,
    Math.floor((nowMs - new Date(checkInAt).getTime()) / 1000),
  );

  return (
    <StyledShiftInfo>
      <StyledTimerLabel>{t`On shift for`}</StyledTimerLabel>
      <StyledTimer>{formatElapsed(elapsedSeconds)}</StyledTimer>
    </StyledShiftInfo>
  );
};

type ShiftTodayActionProps = {
  shift: ShiftRecord | null;
  template: ShiftTemplateRecord | undefined;
  previousHandover: ShiftHandoverEntry | null;
  onCheckIn: (shiftId: string) => Promise<void>;
  onCheckOut: (shiftId: string, handoverNote: string | null) => Promise<void>;
};

export const ShiftTodayAction = ({
  shift,
  template,
  previousHandover,
  onCheckIn,
  onCheckOut,
}: ShiftTodayActionProps) => {
  const { t } = useLingui();
  const { openModal } = useModal();
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  if (!isDefined(shift)) {
    return (
      <StyledCard>
        <StyledHeading>{t`Up next`}</StyledHeading>
        <StyledEmpty>{t`No upcoming shift to check in.`}</StyledEmpty>
      </StyledCard>
    );
  }

  const isInProgress = shift.status === 'IN_PROGRESS';
  const checkOutModalId = `shift-check-out-modal-${shift.id}`;
  const checkInAnchorId = `shift-today-check-in-${shift.id}`;

  const timeWindow = formatTimeWindow(shift.startTime, shift.endTime);

  const earlyCheckInMinutes = template?.earlyCheckInMinutes ?? null;
  const canCheckIn = isCheckInWindowOpen({
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    earlyCheckInMinutes,
  });
  const opensAtLabel = isDefined(shift.startTime)
    ? getCheckInOpensAtLabel(shift.startTime, earlyCheckInMinutes)
    : null;

  // Once the check-in window is open the card reads "Awaiting check-in" (action
  // due now) rather than a passive "Upcoming".
  const statusLabel = isInProgress
    ? t`In progress`
    : canCheckIn
      ? t`Awaiting check-in`
      : t`Upcoming`;
  const statusColor =
    !isInProgress && canCheckIn
      ? 'yellow'
      : getShiftStatusTagColor(shift.status);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      await onCheckIn(shift.id);
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <StyledCard>
      <StyledHeading>
        {isInProgress ? t`Current shift` : t`Up next`}
      </StyledHeading>
      <StyledShiftInfo>
        <StyledTitleRow>
          <StyledShiftName>{shift.name}</StyledShiftName>
          <Tag color={statusColor} text={statusLabel} />
        </StyledTitleRow>
        {isDefined(timeWindow) && (
          <StyledTimeWindow>{timeWindow}</StyledTimeWindow>
        )}
      </StyledShiftInfo>
      {isInProgress && isDefined(shift.checkInAt) && (
        <ShiftElapsedTimer checkInAt={shift.checkInAt} />
      )}
      {isInProgress ? (
        <Button
          title={t`Check out`}
          variant="primary"
          accent="danger"
          fullWidth
          onClick={() => openModal(checkOutModalId)}
        />
      ) : (
        <>
          <StyledActionAnchor id={checkInAnchorId}>
            <Button
              title={t`Check in`}
              variant="primary"
              accent="blue"
              fullWidth
              onClick={handleCheckIn}
              disabled={!canCheckIn || isCheckingIn}
            />
          </StyledActionAnchor>
          {!canCheckIn && isDefined(opensAtLabel) && (
            <AppTooltip
              anchorSelect={`#${checkInAnchorId}`}
              content={t`Opens at ${opensAtLabel}`}
              place="top"
              delay={TooltipDelay.shortDelay}
            />
          )}
        </>
      )}
      {isDefined(previousHandover) && (
        <StyledHandover>
          <StyledHandoverLabel>{t`Handover from previous shift`}</StyledHandoverLabel>
          <StyledHandoverNote>
            {previousHandover.handoverNote}
          </StyledHandoverNote>
          <StyledHandoverMeta>
            {formatHandoverMeta(previousHandover)}
          </StyledHandoverMeta>
        </StyledHandover>
      )}
      <CheckOutModal
        modalInstanceId={checkOutModalId}
        shiftName={shift.name}
        onConfirm={(handoverNote) => onCheckOut(shift.id, handoverNote)}
      />
    </StyledCard>
  );
};
