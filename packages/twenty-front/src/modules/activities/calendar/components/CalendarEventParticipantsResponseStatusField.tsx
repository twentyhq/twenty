import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRef } from 'react';

import { type CalendarEventParticipant } from '@/activities/calendar/types/CalendarEventParticipant';
import { ParticipantChip } from '@/activities/components/ParticipantChip';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { EllipsisDisplay } from '@/ui/field/display/components/EllipsisDisplay';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { IconCheck, IconQuestionMark, IconX } from 'twenty-ui/display';

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
  width: 100%;
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
const StyledDiv = styled.div`
  max-width: 70%;
`;

export const CalendarEventParticipantsResponseStatusField = ({
  responseStatus,
  participants,
}: {
  responseStatus: 'Yes' | 'Maybe' | 'No';
  participants: CalendarEventParticipant[];
}) => {
  const theme = useTheme();

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

  const participantsContainerRef = useRef<HTMLDivElement>(null);
  const styledChips = orderedParticipants.map((participant, index) => (
    <ParticipantChip key={index} participant={participant} />
  ));

  return (
    <StyledPropertyBox>
      <StyledInlineCellBaseContainer>
        <StyledLabelAndIconContainer>
          <StyledIconContainer>{Icon}</StyledIconContainer>

          <StyledLabelContainer width={72}>
            <EllipsisDisplay>{responseStatus}</EllipsisDisplay>
          </StyledLabelContainer>
        </StyledLabelAndIconContainer>
        <StyledDiv ref={participantsContainerRef}>
          <ExpandableList isChipCountDisplayed>{styledChips}</ExpandableList>
        </StyledDiv>
      </StyledInlineCellBaseContainer>
    </StyledPropertyBox>
  );
};
