import type { ObjectConfig } from '@/sdk/objects/object-config';
import {
  type FieldManifest,
  type ObjectFieldManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { generateDefaultFieldUniversalIdentifier } from '@/cli/utilities/build/manifest/utils/generate-default-field-universal-identifier';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { capitalize } from 'twenty-shared/utils';

type DefaultRelationConfig = {
  fieldName: string;
  label: string;
  targetLabel: string;
  icon: string;
  standardObjectKey: keyof typeof STANDARD_OBJECTS;
};

const DEFAULT_RELATION_CONFIGS: DefaultRelationConfig[] = [
  {
    fieldName: 'timelineActivities',
    label: 'Timeline Activities',
    targetLabel: 'Timeline Activity',
    icon: 'IconBuildingSkyscraper',
    standardObjectKey: 'timelineActivity',
  },
  {
    fieldName: 'favorites',
    label: 'Favorites',
    targetLabel: 'Favorite',
    icon: 'IconBuildingSkyscraper',
    standardObjectKey: 'favorite',
  },
  {
    fieldName: 'attachments',
    label: 'Attachments',
    targetLabel: 'Attachment',
    icon: 'IconBuildingSkyscraper',
    standardObjectKey: 'attachment',
  },
  {
    fieldName: 'noteTargets',
    label: 'Note Targets',
    targetLabel: 'Note Target',
    icon: 'IconBuildingSkyscraper',
    standardObjectKey: 'noteTarget',
  },
  {
    fieldName: 'taskTargets',
    label: 'Task Targets',
    targetLabel: 'Task Target',
    icon: 'IconBuildingSkyscraper',
    standardObjectKey: 'taskTarget',
  },
];

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

    // Forward field: lives on the custom object, points to the standard object
    const forwardField: ObjectFieldManifest = {
      name: config.fieldName,
      label: config.label,
      description: `${objectConfig.labelPlural} tied to the ${config.targetLabel}`,
      icon: config.icon,
      isNullable: false,
      type: FieldMetadataType.RELATION,
      universalIdentifier: forwardFieldUniversalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier:
        reverseFieldUniversalIdentifier,
      relationTargetObjectMetadataUniversalIdentifier:
        standardObject.universalIdentifier,
    };

    const reverseField = {
      name: `target${capitalize(objectConfig.nameSingular)}`,
      label: objectConfig.labelSingular,
      description: `${config.targetLabel} tied to the ${objectConfig.labelSingular}`,
      icon: objectConfig.icon ?? 'IconBuildingSkyscraper',
      isNullable: true,
      type: FieldMetadataType.RELATION,
      universalIdentifier: reverseFieldUniversalIdentifier,
      objectUniversalIdentifier: standardObject.universalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier:
        forwardFieldUniversalIdentifier,
      relationTargetObjectMetadataUniversalIdentifier:
        objectConfig.universalIdentifier,
    } as FieldManifest;

    objectFields.push(forwardField);
    fields.push(reverseField);
  }

  return { objectFields, fields };
};
