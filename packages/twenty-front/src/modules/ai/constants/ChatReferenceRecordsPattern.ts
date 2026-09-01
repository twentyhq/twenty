import { CHAT_REFERENCE_LABEL_PATTERN } from '@/ai/constants/ChatReferenceLabelPattern';
import { CHAT_REFERENCE_UUID_PATTERN } from '@/ai/constants/ChatReferenceUuidPattern';

export const CHAT_REFERENCE_RECORDS_PATTERN = `\\[\\[records:(?<objectMetadataId>${CHAT_REFERENCE_UUID_PATTERN}):(?<recordsLabel>${CHAT_REFERENCE_LABEL_PATTERN})\\]\\]`;
