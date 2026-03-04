/* @license Enterprise */

import { FieldMetadataType, CoreObjectNameSingular } from 'twenty-shared/types';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const hasRelationToWorkspaceMember = (
  targetObjectNameSingular: string,
  objectMetadataItems: ObjectMetadataItem[],
): boolean => {
  if (targetObjectNameSingular === CoreObjectNameSingular.WorkspaceMember) {
    return false; // Direct relation, handled by existing logic
  }

  const targetObjectMetadata = objectMetadataItems.find(
    (item) => item.nameSingular === targetObjectNameSingular,
  );

  if (!targetObjectMetadata) {
    return false;
  }

  return targetObjectMetadata.fields.some(
    (field) =>
      field.type === FieldMetadataType.RELATION &&
      field.relation?.targetObjectMetadata.nameSingular ===
        CoreObjectNameSingular.WorkspaceMember,
  );
};
