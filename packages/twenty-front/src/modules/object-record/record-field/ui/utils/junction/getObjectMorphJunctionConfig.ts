import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import {
  getJunctionConfig,
  type JunctionConfig,
} from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { getSourceJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getSourceJoinColumnName';
import { isJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationField';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type ObjectMorphJunctionConfig = JunctionConfig & {
  // Field on the object holding the junction records, e.g. `note.noteTargets`
  junctionField: FieldMetadataItem;
  // Field on the junction pointing back at the object, e.g. `noteTarget.note`
  sourceField: FieldMetadataItem;
  // Join column of the object on the junction, e.g. `noteTarget.noteId`
  sourceJoinColumnName: string;
  junctionObjectMetadata: EnrichedObjectMetadataItem;
};

const getInferredMorphTargetFieldId = ({
  junctionField,
  objectMetadataItems,
}: {
  junctionField: FieldMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): string | null => {
  if (!isDefined(junctionField.relation)) {
    return null;
  }

  const junctionObjectMetadata = objectMetadataItems.find(
    ({ id }) => id === junctionField.relation?.targetObjectMetadata.id,
  );
  const sourceField = junctionObjectMetadata?.fields.find(
    ({ id }) => id === junctionField.relation?.targetFieldMetadata.id,
  );
  const morphTargetFields = junctionObjectMetadata?.fields.filter(
    ({ type }) => type === FieldMetadataType.MORPH_RELATION,
  );

  return sourceField?.type === FieldMetadataType.RELATION &&
    morphTargetFields?.length === 1
    ? morphTargetFields[0].id
    : null;
};

export const getObjectMorphJunctionConfig = ({
  objectMetadata,
  objectMetadataItems,
}: {
  objectMetadata: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): ObjectMorphJunctionConfig | null => {
  const inferredJunctionConfigs: ObjectMorphJunctionConfig[] = [];

  for (const junctionField of objectMetadata.fields) {
    const explicitJunctionConfig = isJunctionRelationField(junctionField)
      ? getJunctionConfig({
          settings: junctionField.settings,
          relationObjectMetadataId:
            junctionField.relation?.targetObjectMetadata.id ?? '',
          sourceObjectMetadataId: objectMetadata.id,
          objectMetadataItems,
        })
      : null;

    if (
      isDefined(explicitJunctionConfig) &&
      !explicitJunctionConfig.isMorphRelation
    ) {
      continue;
    }

    const inferredTargetFieldId = isDefined(explicitJunctionConfig)
      ? null
      : getInferredMorphTargetFieldId({
          junctionField,
          objectMetadataItems,
        });
    const junctionConfig =
      explicitJunctionConfig ??
      (isDefined(inferredTargetFieldId)
        ? getJunctionConfig({
            settings: {
              ...junctionField.settings,
              junctionTargetFieldId: inferredTargetFieldId,
            },
            relationObjectMetadataId:
              junctionField.relation?.targetObjectMetadata.id ?? '',
            sourceObjectMetadataId: objectMetadata.id,
            objectMetadataItems,
          })
        : null);

    if (
      !junctionConfig?.isMorphRelation ||
      !isDefined(junctionConfig.sourceField)
    ) {
      continue;
    }

    const junctionObjectMetadata = objectMetadataItems.find(
      ({ id }) => id === junctionConfig.junctionObjectMetadata.id,
    );
    const sourceJoinColumnName = getSourceJoinColumnName({
      sourceField: junctionConfig.sourceField,
      sourceObjectMetadata: objectMetadata,
    });

    if (
      !isDefined(junctionObjectMetadata) ||
      !isDefined(sourceJoinColumnName)
    ) {
      continue;
    }

    const resolvedJunctionConfig = {
      ...junctionConfig,
      junctionObjectMetadata,
      junctionField,
      sourceField: junctionConfig.sourceField,
      sourceJoinColumnName,
    };

    if (isDefined(explicitJunctionConfig)) {
      return resolvedJunctionConfig;
    }

    inferredJunctionConfigs.push(resolvedJunctionConfig);
  }

  // Older workspaces can lack the junction target marker. The relation graph is
  // still authoritative when it describes exactly one morph junction.
  return inferredJunctionConfigs.length === 1
    ? inferredJunctionConfigs[0]
    : null;
};
