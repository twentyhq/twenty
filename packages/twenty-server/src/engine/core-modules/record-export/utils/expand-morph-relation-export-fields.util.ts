import { msg } from '@lingui/core/macro';
import { doNotTranslate } from 'twenty-shared/i18n';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  type buildRecordExportColumns,
  expandRecordExportMorphFields,
  isDefined,
  isMorphRelationHead,
} from 'twenty-shared/utils';

import { RecordExportException } from 'src/engine/core-modules/record-export/record-export.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const expandMorphRelationExportFields = ({
  fields,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  shouldIncludeInactiveFields = false,
}: {
  fields: FlatFieldMetadata[];
  flatObjectMetadata: Pick<FlatObjectMetadata, 'fieldIds'>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  shouldIncludeInactiveFields?: boolean;
}): Parameters<typeof buildRecordExportColumns>[0] => {
  const objectFields = findManyFlatEntityByIdInFlatEntityMaps({
    flatEntityIds: flatObjectMetadata.fieldIds,
    flatEntityMaps: flatFieldMetadataMaps,
  });
  const exportedFieldIds = new Set<string>();

  return fields.flatMap((field) => {
    if (!isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION)) {
      exportedFieldIds.add(field.id);

      const exportField = {
        name: field.name,
        label: field.label,
        type: field.type,
      };

      if (isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION)) {
        return [{ ...exportField, relationType: field.settings.relationType }];
      }

      return [exportField];
    }

    const morphTargets = objectFields
      .filter((objectField) =>
        isFlatFieldMetadataOfType(
          objectField,
          FieldMetadataType.MORPH_RELATION,
        ),
      )
      .filter(
        (objectField) =>
          objectField.morphId === field.morphId &&
          (shouldIncludeInactiveFields || objectField.isActive) &&
          !isMorphRelationHead(objectField) &&
          !exportedFieldIds.has(objectField.id),
      )
      .map((target) => {
        exportedFieldIds.add(target.id);

        const targetObject = isDefined(target.relationTargetObjectMetadataId)
          ? findFlatEntityByIdInFlatEntityMaps({
              flatEntityId: target.relationTargetObjectMetadataId,
              flatEntityMaps: flatObjectMetadataMaps,
            })
          : undefined;

        if (!isDefined(targetObject)) {
          throw new RecordExportException(
            doNotTranslate('An export field is no longer available.'),
            'MORPH_TARGET_NOT_FOUND',
            {
              userFriendlyMessage: msg`An export field is no longer available.`,
            },
          );
        }

        return {
          fieldName: target.name,
          labelSingular: targetObject.labelSingular,
          relationType: target.settings.relationType,
        };
      });

    return expandRecordExportMorphFields({ label: field.label, morphTargets });
  });
};
