import { type TimelineThreadParticipantDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread-participant.dto';
import { filterActiveParticipants } from 'src/engine/core-modules/messaging/utils/filter-active-participants.util';
import { formatThreadParticipant } from 'src/engine/core-modules/messaging/utils/format-thread-participant.util';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';

export const extractParticipantSummary = (
  messageParticipants: MessageParticipantWorkspaceEntity[],
): {
  firstParticipant: TimelineThreadParticipantDTO;
  lastTwoParticipants: TimelineThreadParticipantDTO[];
  participantCount: number;
} => {
  const activeMessageParticipants =
    filterActiveParticipants(messageParticipants);

  const firstParticipant = formatThreadParticipant(
    activeMessageParticipants[0],
  );

  const activeMessageParticipantsWithoutFirstParticipant =
    activeMessageParticipants.filter(
      (threadParticipant) =>
        threadParticipant.handle !== firstParticipant.handle,
    );

  const lastTwoParticipants: TimelineThreadParticipantDTO[] = [];

  const lastParticipant =
    activeMessageParticipantsWithoutFirstParticipant.slice(-1)[0];

  if (lastParticipant) {
    lastTwoParticipants.push(formatThreadParticipant(lastParticipant));

    const activeMessageParticipantsWithoutFirstAndLastParticipants =
      activeMessageParticipantsWithoutFirstParticipant.filter(
        (threadParticipant) =>
          threadParticipant.handle !== lastParticipant.handle,
      );

    if (activeMessageParticipantsWithoutFirstAndLastParticipants.length > 0) {
      lastTwoParticipants.push(
        formatThreadParticipant(
          activeMessageParticipantsWithoutFirstAndLastParticipants.slice(-1)[0],
        ),
      );
    }
  }

  return {
    firstParticipant,
    lastTwoParticipants,
    participantCount: activeMessageParticipants.length,
  };
};
