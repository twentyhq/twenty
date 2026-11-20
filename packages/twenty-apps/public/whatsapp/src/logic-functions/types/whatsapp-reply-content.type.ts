export type WhatsAppReplyContent =
  | { type: 'text'; text: { body: string } }
  | { type: 'image'; image: { id: string } }
  | { type: 'video'; video: { id: string } }
  | { type: 'audio'; audio: { id: string } }
  | { type: 'document'; document: { id: string; filename: string } };
