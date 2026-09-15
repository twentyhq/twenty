import { type MessageDescriptor } from './message-descriptor.type';

export const normalizeMessageDescriptor = (
  descriptor: string | MessageDescriptor,
): MessageDescriptor =>
  typeof descriptor === 'string' ? { message: descriptor } : descriptor;
