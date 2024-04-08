import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconCheck, IconQuestionMark, IconX } from 'twenty-ui';

import { CalendarEventParticipant } from '@/activities/calendar/types/CalendarEventParticipant';
import { ParticipantChip } from '@/activities/components/ParticipantChip';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { EllipsisDisplay } from '@/ui/field/display/components/EllipsisDisplay';

const StyledInlineCellBaseContainer = styled.div`
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  display: flex;

  gap: ${({ theme }) => theme.spacing(1)};

  position: relative;
  user-select: none;
`;

const StyledPropertyBox = styled(PropertyBox)`
  height: ${({ theme }) => theme.spacing(6)};
  padding: 0;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  width: 16px;

  svg {
    align-items: center;
    display: flex;
    height: 16px;
    justify-content: center;
    width: 16px;
  }
`;

const StyledLabelAndIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledLabelContainer = styled.div<{ width?: number }>`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  width: ${({ width }) => width}px;
`;

const StyledParticipantsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
`;

const StyledParticipantChip = styled(ParticipantChip)<{ isInView: boolean }>`
  opacity: ${({ isInView }) => (isInView ? 1 : 0)};
`;

const ParticipantChipWithIntersectionObserver = ({
  participant,
  setParticipantsInView,
}: {
  participant: CalendarEventParticipant;
  setParticipantsInView: React.Dispatch<React.SetStateAction<Set<string>>>;
}) => {
  const { ref, inView } = useInView({
    threshold: 1,
    onChange: (inView) => {
      if (inView) {
        setParticipantsInView((prev: Set<string>) => {
          const newSet = new Set(prev);
          newSet.add(participant.id);
          return newSet;
        });
      }
      if (!inView) {
        setParticipantsInView((prev: Set<string>) => {
          const newSet = new Set(prev);
          newSet.delete(participant.id);
          return newSet;
        });
      }
    },
  });

  return (
    <div ref={ref}>
      <StyledParticipantChip participant={participant} isInView={inView} />
    </div>
  );
};

export const CalendarEventParticipantsResponseStatusField = ({
  responseStatus,
  participants,
}: {
  responseStatus: 'Yes' | 'Maybe' | 'No';
  participants: CalendarEventParticipant[];
}) => {
  const theme = useTheme();

  const [participantsInView, setParticipantsInView] = useState(
    new Set<string>(),
  );

  const Icon = {
    Yes: <IconCheck stroke={theme.icon.stroke.sm} />,
    Maybe: <IconQuestionMark stroke={theme.icon.stroke.sm} />,
    No: <IconX stroke={theme.icon.stroke.sm} />,
  }[responseStatus];

  // We want to display external participants first
  const orderedParticipants = [
    ...participants.filter((participant) => participant.person),
    ...participants.filter(
      (participant) => !participant.person && !participant.workspaceMember,
    ),
    ...participants.filter((participant) => participant.workspaceMember),
  ];

  return (
    <StyledPropertyBox>
      <StyledInlineCellBaseContainer>
        <StyledLabelAndIconContainer>
          <StyledIconContainer>{Icon}</StyledIconContainer>

          <StyledLabelContainer width={72}>
            <EllipsisDisplay>{responseStatus}</EllipsisDisplay>
          </StyledLabelContainer>
        </StyledLabelAndIconContainer>

        <StyledParticipantsContainer>
          {orderedParticipants.map((participant, index) => (
            <>
              <ParticipantChipWithIntersectionObserver
                key={index}
                participant={participant}
                setParticipantsInView={setParticipantsInView}
              />
              {index === participantsInView.size - 1 &&
                orderedParticipants.length - participantsInView.size !== 0 && (
                  <EllipsisDisplay>{`+${
                    orderedParticipants.length - participantsInView.size
                  }`}</EllipsisDisplay>
                )}{' '}
            </>
          ))}
        </StyledParticipantsContainer>
      </StyledInlineCellBaseContainer>
    </StyledPropertyBox>
  );
};
