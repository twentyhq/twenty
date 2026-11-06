import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ValidationRuleViolation } from '@/validation-rules/types/ValidationRuleViolation';

export type RecordUpdateFormCompletionRequest = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  draftRecord: Partial<ObjectRecord>;
  fieldMetadataIds: string[];
  violations: ValidationRuleViolation[];
};
