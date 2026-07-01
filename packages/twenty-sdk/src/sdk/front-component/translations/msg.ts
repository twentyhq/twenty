import { normalizeMessageDescriptor, type MessageDescriptor } from './message';

export const msg = (
  descriptor: string | MessageDescriptor,
): MessageDescriptor => normalizeMessageDescriptor(descriptor);
