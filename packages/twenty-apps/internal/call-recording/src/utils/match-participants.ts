export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  platform: string;
}

export const matchParticipants = async (
  callRecordingId: string,
  participants: Participant[],
): Promise<void> => {
  if (!participants.length) {
    console.log('No participants to match, skipping');

    return;
  }

  console.log(
    `Matching ${participants.length} participants for call recording ${callRecordingId}`,
  );

  for (const participant of participants) {
    console.log(
      `Participant: name=${participant.name}, id=${participant.id}, isHost=${participant.isHost}, platform=${participant.platform}`,
    );
  }
};
