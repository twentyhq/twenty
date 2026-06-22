import { styled } from '@linaria/react';
import { useContext, useRef } from 'react';

import { ParticipantChip } from '@/activities/components/ParticipantChip';
import { type CalendarEventParticipant } from '@/activities/calendar/types/CalendarEventParticipant';
import { EllipsisDisplay } from '@/ui/field/display/components/EllipsisDisplay';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { IconCheck, IconQuestionMark, IconX } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledResponseStatusRow = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-height: ${themeCssVariables.spacing[6]};
  position: relative;
  user-select: none;
  width: 100%;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
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
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledLabelContainer = styled.div<{ width?: number }>`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  width: ${({ width }) => (width !== undefined ? `${width}px` : 'auto')};
`;

const StyledParticipantsContainer = styled.div`
  max-width: 70%;
`;

export const CalendarEventParticipantsResponseStatusField = ({
  responseStatus,
  participants,
}: {
  responseStatus: 'Yes' | 'Maybe' | 'No';
  participants: CalendarEventParticipant[];
}) => {
  const { theme } = useContext(ThemeContext);

  const Icon = {
    Yes: <IconCheck stroke={theme.icon.stroke.sm} />,
    Maybe: <IconQuestionMark stroke={theme.icon.stroke.sm} />,
    No: <IconX stroke={theme.icon.stroke.sm} />,
  }[responseStatus];

  const orderedParticipants = [
    ...participants.filter((participant) => participant.person),
    ...participants.filter((participant) => participant.workspaceMember),
    ...participants.filter(
      (participant) => !participant.person && !participant.workspaceMember,
    ),
  ];

  const participantsContainerRef = useRef<HTMLDivElement>(null);
  const styledChips = orderedParticipants.map((participant) => (
    <ParticipantChip key={participant.id} participant={participant} />
  ));

  return (
    <StyledResponseStatusRow>
      <StyledLabelAndIconContainer>
        <StyledIconContainer>{Icon}</StyledIconContainer>
        <StyledLabelContainer width={72}>
          <EllipsisDisplay>{responseStatus}</EllipsisDisplay>
        </StyledLabelContainer>
      </StyledLabelAndIconContainer>
      <StyledParticipantsContainer ref={participantsContainerRef}>
        <ExpandableList isChipCountDisplayed>{styledChips}</ExpandableList>
      </StyledParticipantsContainer>
    </StyledResponseStatusRow>
  );
};
