import { type FieldRelationMetadataSettings } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isDefined } from 'twenty-shared/utils';

// Type guard to check if a field has junction configuration
export const hasJunctionTargetRelationFieldIds = (
  settings: FieldRelationMetadataSettings | undefined,
): settings is NonNullable<FieldRelationMetadataSettings> & {
  junctionTargetRelationFieldIds: string[];
} => {
  return (
    isDefined(settings) &&
    isDefined(settings.junctionTargetRelationFieldIds) &&
    settings.junctionTargetRelationFieldIds.length > 0
  );
};
