import { type ImportMessageParticipant } from 'src/logic-functions/types/import-message-participant.type';

export type ImportMessage = {
  externalId: string;
  messageThreadExternalId: string;
  headerMessageId?: string;
  subject?: string;
  text: string;
  receivedAt: string;
  direction: 'INCOMING' | 'OUTGOING';
  participants: ImportMessageParticipant[];
};
