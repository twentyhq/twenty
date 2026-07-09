export type ImportMessageParticipant = {
  role: 'FROM' | 'TO' | 'CC' | 'BCC' | 'REPLY_TO';
  handle: string;
  displayName?: string;
};
