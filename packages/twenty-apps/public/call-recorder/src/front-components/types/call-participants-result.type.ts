import { type CallParticipantNode } from 'src/front-components/types/call-participant-node.type';

export type CallParticipantsResult =
  | { kind: 'callRecordingNotFound' }
  | { kind: 'notLinkedToMeeting' }
  | { kind: 'loaded'; participants: CallParticipantNode[] };
