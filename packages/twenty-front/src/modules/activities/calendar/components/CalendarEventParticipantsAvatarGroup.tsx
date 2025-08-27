import { type CalendarEventParticipant } from '@/activities/calendar/types/CalendarEventParticipant';
import { isTimelineCalendarEventParticipant } from '@/activities/calendar/types/guards/IsTimelineCalendarEventParticipant';
import { isDefined } from 'twenty-shared/utils';
import { Avatar, AvatarGroup } from 'twenty-ui/display';
import { type TimelineCalendarEventParticipant } from '~/generated-metadata/graphql';

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
      avatars={timelineParticipants.map((participant) => (
        <Avatar
          key={[participant.workspaceMemberId, participant.displayName]
            .filter(isDefined)
            .join('-')}
          avatarUrl={participant.avatarUrl}
          placeholder={
            participant.firstName && participant.lastName
              ? `${participant.firstName} ${participant.lastName}`
              : participant.displayName
          }
          placeholderColorSeed={
            participant.workspaceMemberId || participant.personId || ''
          }
          type="rounded"
        />
      ))}
    />
  );
};
