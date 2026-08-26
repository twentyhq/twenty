import { CHAT_REFERENCE_LABEL_PATTERN } from '@/ai/constants/ChatReferenceLabelPattern';
import { CHAT_REFERENCE_METADATA_NAME_PATTERN } from '@/ai/constants/ChatReferenceMetadataNamePattern';

export const CHAT_REFERENCE_FIELD_PATTERN = `\\[\\[field:(?<fieldObjectNameSingular>${CHAT_REFERENCE_METADATA_NAME_PATTERN}):(?<fieldName>${CHAT_REFERENCE_METADATA_NAME_PATTERN}):(?<fieldLabel>${CHAT_REFERENCE_LABEL_PATTERN})\\]\\]`;
