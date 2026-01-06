import { type FieldRelationMetadataSettings } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isDefined } from 'twenty-shared/utils';

type GetJoinColumnNameArgs = {
  fieldName: string;
  settings?: FieldRelationMetadataSettings;
};

// Get join column name from settings, or compute it from field name
// The join column is the foreign key column (e.g., "petId" for a "pet" relation)
export const getJoinColumnName = ({
  fieldName,
  settings,
}: GetJoinColumnNameArgs): string => {
  if (isDefined(settings) && isDefined(settings.joinColumnName)) {
    return settings.joinColumnName;
  }
  return `${fieldName}Id`;
};

