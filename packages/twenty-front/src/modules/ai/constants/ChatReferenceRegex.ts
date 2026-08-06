import { CHAT_REFERENCE_LABEL_PATTERN } from '@/ai/constants/ChatReferenceLabelPattern';
import { CHAT_REFERENCE_METADATA_NAME_PATTERN } from '@/ai/constants/ChatReferenceMetadataNamePattern';
import { CHAT_REFERENCE_UUID_PATTERN } from '@/ai/constants/ChatReferenceUuidPattern';

// The record alternative must stay last: its `record:` prefix is optional, so it
// matches the metadata markers too and would swallow them if tried first.
export const CHAT_REFERENCE_REGEX = new RegExp(
  [
    `\\[\\[object:(?<objectNameSingular>${CHAT_REFERENCE_METADATA_NAME_PATTERN}):(?<objectLabel>${CHAT_REFERENCE_LABEL_PATTERN})\\]\\]`,
    `\\[\\[field:(?<fieldMetadataItemId>${CHAT_REFERENCE_UUID_PATTERN}):(?<fieldLabel>${CHAT_REFERENCE_LABEL_PATTERN})\\]\\]`,
    `\\[\\[view:(?<viewId>${CHAT_REFERENCE_UUID_PATTERN}):(?<viewLabel>${CHAT_REFERENCE_LABEL_PATTERN})\\]\\]`,
    `\\[\\[(?:record:)?(?<recordObjectNameSingular>${CHAT_REFERENCE_METADATA_NAME_PATTERN}):(?<recordId>${CHAT_REFERENCE_UUID_PATTERN}):(?<recordLabel>${CHAT_REFERENCE_LABEL_PATTERN})\\]\\]`,
  ].join('|'),
  'g',
);
