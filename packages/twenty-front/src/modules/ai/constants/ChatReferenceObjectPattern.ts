import { CHAT_REFERENCE_LABEL_PATTERN } from '@/ai/constants/ChatReferenceLabelPattern';
import { CHAT_REFERENCE_METADATA_NAME_PATTERN } from '@/ai/constants/ChatReferenceMetadataNamePattern';

export const CHAT_REFERENCE_OBJECT_PATTERN = `\\[\\[object:(?<objectNameSingular>${CHAT_REFERENCE_METADATA_NAME_PATTERN}):(?<objectLabel>${CHAT_REFERENCE_LABEL_PATTERN})\\]\\]`;
