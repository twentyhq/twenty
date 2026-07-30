import { CHAT_REFERENCE_METADATA_NAME_PATTERN } from '@/ai/constants/ChatReferenceMetadataNamePattern';
import { CHAT_REFERENCE_UUID_PATTERN } from '@/ai/constants/ChatReferenceUuidPattern';

// The record alternative must come last: its `record:` prefix is optional, so it
// is shaped exactly like the metadata markers and would otherwise swallow them.
export const CHAT_REFERENCE_START_REGEX = new RegExp(
  [
    `\\[\\[object:(?<objectNameSingular>${CHAT_REFERENCE_METADATA_NAME_PATTERN}):`,
    `\\[\\[field:(?<fieldMetadataItemId>${CHAT_REFERENCE_UUID_PATTERN}):`,
    `\\[\\[view:(?<viewId>${CHAT_REFERENCE_UUID_PATTERN}):`,
    `\\[\\[(?:record:)?(?<recordObjectNameSingular>${CHAT_REFERENCE_METADATA_NAME_PATTERN}):(?<recordId>${CHAT_REFERENCE_UUID_PATTERN}):`,
  ].join('|'),
  'g',
);
