import {
  STANDARD_OBJECTS,
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
} from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { generateMorphOrRelationFlatFieldMetadataPair } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-morph-or-relation-flat-field-metadata-pair.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-migration/constant/standard-object-icons';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

const morphIdByRelationObjectNameSingular = {
  timelineActivity:
    STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
  favorite: null,
  attachment: STANDARD_OBJECTS.attachment.morphIds.targetMorphId.morphId,
  noteTarget: STANDARD_OBJECTS.noteTarget.morphIds.targetMorphId.morphId,
  taskTarget: STANDARD_OBJECTS.taskTarget.morphIds.targetMorphId.morphId,
} satisfies Record<
  (typeof DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS)[number],
  string | null
>;

export type BuildDefaultRelationFieldsForCustomObjectArgs = {
  existingFlatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  sourceFlatObjectMetadata: UniversalFlatObjectMetadata;
  flatApplication: FlatApplication;
};

type SourceAndTargetFlatFieldMetadatasRecord = {
  standardSourceFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  standardTargetFlatFieldMetadatas: UniversalFlatFieldMetadata[];
};
const EMPTY_SOURCE_AND_TARGET_FLAT_FIELD_METADATAS_RECORD: SourceAndTargetFlatFieldMetadatasRecord =
  {
    standardSourceFlatFieldMetadatas: [],
    standardTargetFlatFieldMetadatas: [],
  };

export const buildDefaultRelationFlatFieldMetadatasForCustomObject = ({
  existingFlatObjectMetadataMaps,
  sourceFlatObjectMetadata,
  flatApplication,
}: BuildDefaultRelationFieldsForCustomObjectArgs): SourceAndTargetFlatFieldMetadatasRecord => {
  const objectIdByNameSingular = Object.values(
    existingFlatObjectMetadataMaps.byUniversalIdentifier,
  ).reduce<Record<string, string>>((acc, flatObject) => {
    if (!isDefined(flatObject)) {
      return acc;
    }

    return {
      ...acc,
      [flatObject.nameSingular]: flatObject.id,
    };
  }, {});

  const result =
    DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.reduce<SourceAndTargetFlatFieldMetadatasRecord>(
      (sourceAndTargetFlatFieldMetadatasRecord, objectMetadataNameSingular) => {
        const isObjectMigratedToMorphRelations =
          objectMetadataNameSingular === 'timelineActivity' ||
          objectMetadataNameSingular === 'attachment' ||
          objectMetadataNameSingular === 'noteTarget' ||
          objectMetadataNameSingular === 'taskTarget';

        const targetFlatObjectMetadataId =
          objectIdByNameSingular[objectMetadataNameSingular];

        if (!isDefined(targetFlatObjectMetadataId)) {
          throw new ObjectMetadataException(
            `Standard target object metadata id ${targetFlatObjectMetadataId} not found in cache`,
            ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR,
          );
        }

        const targetFlatObjectMetadata =
          findFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityMaps: existingFlatObjectMetadataMaps,
            flatEntityId: targetFlatObjectMetadataId,
          });

        const icon =
          STANDARD_OBJECT_ICONS[
            targetFlatObjectMetadata.nameSingular as keyof typeof STANDARD_OBJECT_ICONS
          ] || 'IconBuildingSkyscraper';

        const morphFieldName = `target${capitalize(sourceFlatObjectMetadata.nameSingular)}`;
        const fieldName = isObjectMigratedToMorphRelations
          ? morphFieldName
          : sourceFlatObjectMetadata.nameSingular;
        const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
          name: fieldName,
        });

        const morphId =
          morphIdByRelationObjectNameSingular[objectMetadataNameSingular];

        const { flatFieldMetadatas } =
          generateMorphOrRelationFlatFieldMetadataPair({
            sourceFlatObjectMetadata,
            targetFlatObjectMetadata,
            targetFlatFieldMetadataType: isObjectMigratedToMorphRelations
              ? FieldMetadataType.MORPH_RELATION
              : FieldMetadataType.RELATION,
            flatApplication,
            sourceFlatObjectMetadataJoinColumnName: joinColumnName,
            morphId,
            targetFieldName: fieldName,
            createFieldInput: {
              icon: 'IconBuildingSkyscraper',
              type: FieldMetadataType.RELATION,
              name: targetFlatObjectMetadata.namePlural,
              label: capitalize(targetFlatObjectMetadata.labelPlural),
              isSystem: false,
              relationCreationPayload: {
                type: RelationType.ONE_TO_MANY,
                targetObjectMetadataId: targetFlatObjectMetadata.id,
                targetFieldLabel: capitalize(
                  sourceFlatObjectMetadata.nameSingular,
                ),
                targetFieldIcon: icon,
              },
            },
          });

        return {
          standardSourceFlatFieldMetadatas: [
            ...sourceAndTargetFlatFieldMetadatasRecord.standardSourceFlatFieldMetadatas,
            flatFieldMetadatas[0],
          ],
          standardTargetFlatFieldMetadatas: [
            ...sourceAndTargetFlatFieldMetadatasRecord.standardTargetFlatFieldMetadatas,
            flatFieldMetadatas[1],
          ],
        };
      },
      EMPTY_SOURCE_AND_TARGET_FLAT_FIELD_METADATAS_RECORD,
    );

  return result;
};
