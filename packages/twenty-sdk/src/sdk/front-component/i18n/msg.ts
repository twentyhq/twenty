import { normalizeMessageDescriptor, type MessageDescriptor } from './message';

// Lazy descriptor for strings declared as data (constants, config objects) and
// resolved later with t(descriptor). Mirrors Lingui's msg`` lazy pattern so a
// string can stay translatable while living outside of a render.
export const msg = (
  descriptor: string | MessageDescriptor,
): MessageDescriptor => normalizeMessageDescriptor(descriptor);
