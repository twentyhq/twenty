import { generateDefaultFieldUniversalIdentifier } from '@/cli/utilities/build/manifest/utils/generate-default-field-universal-identifier';
import { RelationType } from '@/sdk';
import type { ObjectConfig } from '@/sdk/objects/object-config';
import {
  type FieldManifest,
  type ObjectFieldManifest,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationOnDeleteAction } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

type DefaultRelationConfig = {
  fieldName: string;
  label: string;
  targetFieldName: (objectConfig: ObjectConfig) => string;
  targetLabel: (objectConfig: ObjectConfig) => string;
  icon: string;
  targetIcon: string;
  standardObjectKey: keyof typeof STANDARD_OBJECTS;
} & (
  | { targetFieldType: FieldMetadataType.RELATION }
  | { targetFieldType: FieldMetadataType.MORPH_RELATION; morphId: string }
);

const DEFAULT_DEFAULT_RELATION = {
  targetFieldName: (objectConfig: ObjectConfig) =>
    `target${capitalize(objectConfig.nameSingular)}`,
  targetLabel: (objectConfig: ObjectConfig) =>
    capitalize(objectConfig.nameSingular),
  icon: 'IconBuildingSkyscraper',
};

const DEFAULT_RELATION_CONFIGS = [
  {
    ...DEFAULT_DEFAULT_RELATION,
    fieldName: 'timelineActivities',
    label: 'Timeline Activities',
    targetIcon: 'IconTimelineEvent',
    targetFieldType: FieldMetadataType.MORPH_RELATION,
    standardObjectKey: 'timelineActivity',
    morphId: STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
  },
  {
    ...DEFAULT_DEFAULT_RELATION,
    fieldName: 'favorites',
    label: 'Favorites',
    icon: 'IconBuildingSkyscraper',
    targetIcon: 'IconHeart',
    targetFieldType: FieldMetadataType.RELATION,
    standardObjectKey: 'favorite',
  },
  {
    ...DEFAULT_DEFAULT_RELATION,
    fieldName: 'attachments',
    label: 'Attachments',
    icon: 'IconBuildingSkyscraper',
    targetIcon: 'IconFileImport',
    targetFieldType: FieldMetadataType.MORPH_RELATION,
    standardObjectKey: 'attachment',
    morphId: STANDARD_OBJECTS.attachment.morphIds.targetMorphId.morphId,
  },
  {
    ...DEFAULT_DEFAULT_RELATION,
    fieldName: 'noteTargets',
    label: 'Note Targets',
    icon: 'IconBuildingSkyscraper',
    targetIcon: 'IconCheckbox',
    targetFieldType: FieldMetadataType.MORPH_RELATION,
    standardObjectKey: 'noteTarget',
    morphId: STANDARD_OBJECTS.noteTarget.morphIds.targetMorphId.morphId,
  },
  {
    ...DEFAULT_DEFAULT_RELATION,
    fieldName: 'taskTargets',
    label: 'Task Targets',
    icon: 'IconBuildingSkyscraper',
    targetIcon: 'IconCheckbox',
    targetFieldType: FieldMetadataType.MORPH_RELATION,
    standardObjectKey: 'taskTarget',
    morphId: STANDARD_OBJECTS.taskTarget.morphIds.targetMorphId.morphId,
  },
] as const satisfies DefaultRelationConfig[];

const buildReverseField = ({
  config,
  forwardFieldUniversalIdentifier,
  objectConfig,
  universalIdentifier,
}: {
  config: DefaultRelationConfig;
  objectConfig: ObjectConfig;
  universalIdentifier: string;
  forwardFieldUniversalIdentifier: string;
}): FieldManifest<typeof config.targetFieldType> => {
  const standardObject = STANDARD_OBJECTS[config.standardObjectKey];

  const commonFields = {
    name: config.targetFieldName(objectConfig),
    label: config.targetLabel(objectConfig),
    description: `${config.targetLabel(objectConfig)} ${objectConfig.labelSingular}`,
    icon: config.targetIcon,
    isNullable: true,
    universalSettings: {
      relationType: RelationType.MANY_TO_ONE,
      onDelete: RelationOnDeleteAction.SET_NULL,
      joinColumnName: `target${capitalize(objectConfig.nameSingular)}Id`,
    },
    universalIdentifier,
    objectUniversalIdentifier: standardObject.universalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier:
      forwardFieldUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier:
      objectConfig.universalIdentifier,
  };

  if (config.targetFieldType === FieldMetadataType.MORPH_RELATION) {
    return {
      ...commonFields,
      type: config.targetFieldType,
      morphId: config.morphId,
    };
  }

  return {
    ...commonFields,
    type: config.targetFieldType,
  };
};

export const getDefaultRelationObjectFields = (
  objectConfig: ObjectConfig,
): { objectFields: ObjectFieldManifest[]; fields: FieldManifest[] } => {
  const objectFields: ObjectFieldManifest[] = [];
  const fields: FieldManifest[] = [];

  for (const config of DEFAULT_RELATION_CONFIGS) {
    const standardObject = STANDARD_OBJECTS[config.standardObjectKey];

    const forwardFieldUniversalIdentifier =
      generateDefaultFieldUniversalIdentifier({
        objectConfig,
        fieldName: config.fieldName,
      });

    const reverseFieldUniversalIdentifier =
      generateDefaultFieldUniversalIdentifier({
        objectConfig,
        fieldName: `${config.fieldName}Inverse`,
      });

    const forwardField: ObjectFieldManifest = {
      name: config.fieldName,
      label: config.label,
      description: `${objectConfig.labelPlural} tied to the ${config.targetLabel(objectConfig)}`,
      icon: config.icon,
      isNullable: false,
      type: FieldMetadataType.RELATION,
      universalSettings: { relationType: RelationType.ONE_TO_MANY },
      universalIdentifier: forwardFieldUniversalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier:
        reverseFieldUniversalIdentifier,
      relationTargetObjectMetadataUniversalIdentifier:
        standardObject.universalIdentifier,
    };

    const reverseField = buildReverseField({
      config,
      objectConfig,
      universalIdentifier: reverseFieldUniversalIdentifier,
      forwardFieldUniversalIdentifier,
    });

    objectFields.push(forwardField);
    fields.push(reverseField);
  }

  return { objectFields, fields };
};
