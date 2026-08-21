import { CHAT_REFERENCE_LABEL_PATTERN } from '@/ai/constants/ChatReferenceLabelPattern';
import { CHAT_REFERENCE_UUID_PATTERN } from '@/ai/constants/ChatReferenceUuidPattern';

export const CHAT_REFERENCE_FIELD_PATTERN = `\\[\\[field:(?<fieldMetadataItemId>${CHAT_REFERENCE_UUID_PATTERN}):(?<fieldLabel>${CHAT_REFERENCE_LABEL_PATTERN})\\]\\]`;
