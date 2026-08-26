import { CHAT_REFERENCE_LABEL_PATTERN } from '@/ai/constants/ChatReferenceLabelPattern';
import { CHAT_REFERENCE_UUID_PATTERN } from '@/ai/constants/ChatReferenceUuidPattern';

export const CHAT_REFERENCE_LEGACY_FIELD_BY_ID_PATTERN = `\\[\\[field:(?<legacyFieldMetadataItemId>${CHAT_REFERENCE_UUID_PATTERN}):(?<legacyFieldLabel>${CHAT_REFERENCE_LABEL_PATTERN})\\]\\]`;
