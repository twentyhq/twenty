import { type CalendarEventParticipant } from '@/activities/calendar/types/CalendarEventParticipant';
import { isTimelineCalendarEventParticipant } from '@/activities/calendar/types/guards/IsTimelineCalendarEventParticipant';
import { isNonEmptyString } from '@sniptt/guards';
import { AvatarGroup } from 'twenty-ui/components/data-display';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { type TimelineCalendarEventParticipant } from '~/generated/graphql';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type CalendarEventParticipantsAvatarGroupProps = {
  participants: CalendarEventParticipant[] | TimelineCalendarEventParticipant[];
};

export const CalendarEventParticipantsAvatarGroup = ({
  participants,
}: CalendarEventParticipantsAvatarGroupProps) => {
  const timelineParticipants: TimelineCalendarEventParticipant[] =
    participants.map((participant) => {
      if (isTimelineCalendarEventParticipant(participant)) {
        return participant;
      } else {
        return {
          id: participant.id,
          personId: participant.person?.id ?? null,
          workspaceMemberId: participant.workspaceMember?.id ?? null,
          firstName:
            participant.person?.name?.firstName ||
            participant.workspaceMember?.name.firstName ||
            '',
          lastName:
            participant.person?.name?.lastName ||
            participant.workspaceMember?.name.lastName ||
            '',
          displayName:
            participant.person?.name?.firstName ||
            participant.person?.name?.lastName ||
            participant.workspaceMember?.name.firstName ||
            participant.workspaceMember?.name.lastName ||
            participant.displayName ||
            participant.handle ||
            '',
          avatarUrl:
            participant.person?.avatarUrl ||
            participant.workspaceMember?.avatarUrl ||
            '',
          handle: participant.handle,
        };
      }
    });

  return (
    <AvatarGroup
      avatars={timelineParticipants.map((participant) => {
        const participantName =
          isNonEmptyString(participant.firstName) &&
          isNonEmptyString(participant.lastName)
            ? `${participant.firstName} ${participant.lastName}`
            : participant.displayName;

        return (
          <Avatar
            key={participant.id}
            src={getAbsoluteImageUrl(participant.avatarUrl)}
            name={participantName}
            imageProps={{ alt: participantName }}
            colorSeed={
              participant.workspaceMemberId || participant.personId || ''
            }
            shape="circle"
          />
        );
      })}
    />
  );
};
