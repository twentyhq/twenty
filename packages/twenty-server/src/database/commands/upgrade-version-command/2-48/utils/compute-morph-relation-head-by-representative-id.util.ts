import { FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isMorphRelationHead,
  pickMorphGroupSurvivorOrThrow,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';

type MorphRelationField = FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;

export const computeMorphRelationHeadByRepresentativeId = (
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): Map<string, FlatFieldMetadata> => {
  const targetsByMorphId = new Map<string, MorphRelationField[]>();

  for (const field of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  )) {
    if (
      isDefined(field) &&
      isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION) &&
      !isMorphRelationHead(field)
    ) {
      targetsByMorphId.set(field.morphId, [
        ...(targetsByMorphId.get(field.morphId) ?? []),
        field,
      ]);
    }
  }

  const headByRepresentativeId = new Map<string, FlatFieldMetadata>();

  for (const [morphId, targets] of targetsByMorphId) {
    const head = flatFieldMetadataMaps.byUniversalIdentifier[morphId];
    const representative = pickMorphGroupSurvivorOrThrow(
      targets.map((target) =>
        resolveEffectiveFlatEntity({
          metadataName: 'fieldMetadata',
          flatEntity: target,
        }),
      ),
    );

    if (isDefined(head)) {
      headByRepresentativeId.set(representative.id, head);
    }
  }

  return headByRepresentativeId;
};
