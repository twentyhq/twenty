import { type ObjectFieldManifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';

export const fromFlatFieldMetadataToObjectFieldManifest = ({
  flatFieldMetadata,
}: {
  flatFieldMetadata: FlatFieldMetadata;
}): ObjectFieldManifest => {
  const isRelation = isMorphOrRelationFieldMetadataType(flatFieldMetadata.type);

  return {
    universalIdentifier: flatFieldMetadata.universalIdentifier,
    type: flatFieldMetadata.type,
    name: flatFieldMetadata.name,
    label: flatFieldMetadata.label,
    ...(isDefined(flatFieldMetadata.description)
      ? { description: flatFieldMetadata.description }
      : {}),
    ...(isDefined(flatFieldMetadata.icon)
      ? { icon: flatFieldMetadata.icon }
      : {}),
    ...(isDefined(flatFieldMetadata.defaultValue) && !isRelation
      ? { defaultValue: flatFieldMetadata.defaultValue }
      : {}),
    ...(isDefined(flatFieldMetadata.options)
      ? { options: flatFieldMetadata.options }
      : {}),
    ...(isDefined(flatFieldMetadata.universalSettings)
      ? { universalSettings: flatFieldMetadata.universalSettings }
      : {}),
    isNullable: flatFieldMetadata.isNullable ?? true,
    isUIEditable: flatFieldMetadata.isUIEditable ?? true,
    isUnique: flatFieldMetadata.isUnique ?? false,
    ...(flatFieldMetadata.isActive === false ? { isActive: false } : {}),
    ...(isRelation
      ? {
          relationTargetObjectMetadataUniversalIdentifier:
            flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
          relationTargetFieldMetadataUniversalIdentifier:
            flatFieldMetadata.relationTargetFieldMetadataUniversalIdentifier,
          ...(flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION
            ? { morphId: flatFieldMetadata.morphId }
            : {}),
        }
      : {}),
  } as ObjectFieldManifest;
};
