import { CHAT_REFERENCE_LABEL_PATTERN } from '@/ai/constants/ChatReferenceLabelPattern';
import { CHAT_REFERENCE_METADATA_NAME_PATTERN } from '@/ai/constants/ChatReferenceMetadataNamePattern';
import { CHAT_REFERENCE_UUID_PATTERN } from '@/ai/constants/ChatReferenceUuidPattern';

// The `record:` prefix stays optional: messages written before it existed only
// carry the object name.
export const CHAT_REFERENCE_RECORD_PATTERN = `\\[\\[(?:record:)?(?<recordObjectNameSingular>${CHAT_REFERENCE_METADATA_NAME_PATTERN}):(?<recordId>${CHAT_REFERENCE_UUID_PATTERN}):(?<recordLabel>${CHAT_REFERENCE_LABEL_PATTERN})\\]\\]`;
