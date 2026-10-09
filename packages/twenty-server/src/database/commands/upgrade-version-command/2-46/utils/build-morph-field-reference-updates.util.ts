import { FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isMorphRelationGroup,
  pickMorphGroupSurvivorOrThrow,
} from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

import { buildMorphViewFieldReferenceUpdates } from 'src/database/commands/upgrade-version-command/2-46/utils/build-morph-view-field-reference-updates.util';
import { buildMorphPermissionReferenceUpdates } from 'src/database/commands/upgrade-version-command/2-46/utils/build-morph-permission-reference-updates.util';
import { buildMorphJunctionReferenceUpdates } from 'src/database/commands/upgrade-version-command/2-46/utils/build-morph-junction-reference-updates.util';
import { buildMorphWidgetReferenceUpdates } from 'src/database/commands/upgrade-version-command/2-46/utils/build-morph-widget-reference-updates.util';

export const buildMorphFieldReferenceUpdates = ({
  flatFieldMetadataMaps,
  flatViewFieldMaps,
  flatFieldPermissionMaps,
  flatPageLayoutWidgetMaps,
  direction,
}: Pick<
  AllFlatEntityMaps,
  | 'flatFieldMetadataMaps'
  | 'flatViewFieldMaps'
  | 'flatFieldPermissionMaps'
  | 'flatPageLayoutWidgetMaps'
> & {
  direction: 'up' | 'down';
}): AllFlatEntityOperationByMetadataName => {
  const fields = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);
  const replacementByFieldId = new Map<string, FlatFieldMetadata>();
  const replacementByUniversalIdentifier = new Map<string, FlatFieldMetadata>();

  for (const group of fields.filter(isMorphRelationGroup)) {
    const targets = fields.filter(
      (field) =>
        field.type === FieldMetadataType.MORPH_RELATION &&
        field.morphId === group.morphId &&
        field.id !== group.id,
    );
    if (direction === 'down') {
      if (targets.length === 0) {
        throw new Error(
          `Cannot downgrade morph field ${group.name} without a target`,
        );
      }
      const previousField = pickMorphGroupSurvivorOrThrow(targets);
      replacementByFieldId.set(group.id, previousField);
      replacementByUniversalIdentifier.set(
        group.universalIdentifier,
        previousField,
      );
    } else {
      for (const target of targets) {
        replacementByFieldId.set(target.id, group);
        replacementByUniversalIdentifier.set(target.universalIdentifier, group);
      }
    }
  }

  return {
    viewField: buildMorphViewFieldReferenceUpdates({
      flatViewFieldMaps,
      replacementByFieldId,
    }),
    fieldPermission: buildMorphPermissionReferenceUpdates({
      flatFieldMetadataMaps,
      flatFieldPermissionMaps,
      fields,
      replacementByFieldId,
      direction,
    }),
    fieldMetadata: buildMorphJunctionReferenceUpdates({
      fields,
      replacementByUniversalIdentifier,
    }),
    pageLayoutWidget: buildMorphWidgetReferenceUpdates({
      flatPageLayoutWidgetMaps,
      replacementByUniversalIdentifier,
    }),
  };
};
