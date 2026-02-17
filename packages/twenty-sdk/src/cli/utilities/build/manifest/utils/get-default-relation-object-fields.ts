import type { ObjectConfig } from '@/sdk/objects/object-config';
import { type ObjectFieldManifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { generateDefaultFieldUniversalIdentifier } from '@/cli/utilities/build/manifest/utils/generate-default-field-universal-identifier';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

export const getDefaultRelationObjectFields = (
  objectConfig: ObjectConfig,
): ObjectFieldManifest[] => {
  const timelineActivities: ObjectFieldManifest = {
    name: 'timelineActivities',
    label: 'Timeline Activities',
    description: `${objectConfig.labelPlural} tied to the Timeline Activity`,
    icon: 'IconBuildingSkyscraper',
    isNullable: false,
    type: FieldMetadataType.RELATION,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectConfig,
      fieldName: 'timelineActivities',
    }),
    relationTargetFieldMetadataUniversalIdentifier:
      '05558842-1442-49ae-a9ea-7cbd1f132edc',
    relationTargetObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.timelineActivity.universalIdentifier,
  };

  const favorites: ObjectFieldManifest = {
    name: 'favorites',
    label: 'Favorites',
    description: `${objectConfig.labelPlural} tied to the Favorite`,
    icon: 'IconBuildingSkyscraper',
    isNullable: false,
    type: FieldMetadataType.RELATION,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectConfig,
      fieldName: 'favorites',
    }),
    relationTargetFieldMetadataUniversalIdentifier:
      '64804f30-e355-40f1-a07f-c4acacf22a8a',
    relationTargetObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.favorite.universalIdentifier,
  };

  const attachments: ObjectFieldManifest = {
    name: 'attachments',
    label: 'Attachments',
    description: `${objectConfig.labelPlural} tied to the Attachment`,
    icon: 'IconBuildingSkyscraper',
    isNullable: false,
    type: FieldMetadataType.RELATION,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectConfig,
      fieldName: 'attachments',
    }),
    relationTargetFieldMetadataUniversalIdentifier:
      'b1020698-088e-4fcd-84b5-5d1dacd6f019',
    relationTargetObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.attachment.universalIdentifier,
  };

  const noteTargets: ObjectFieldManifest = {
    name: 'noteTargets',
    label: 'Note Targets',
    description: `${objectConfig.labelPlural} tied to the Note Target`,
    icon: 'IconBuildingSkyscraper',
    isNullable: false,
    type: FieldMetadataType.RELATION,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectConfig,
      fieldName: 'noteTargets',
    }),
    relationTargetFieldMetadataUniversalIdentifier:
      '382991cb-fdbc-4ff3-bc43-cbc0470f3073',
    relationTargetObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.noteTarget.universalIdentifier,
  };

  const taskTargets: ObjectFieldManifest = {
    name: 'taskTargets',
    label: 'Task Targets',
    description: `${objectConfig.labelPlural} tied to the Task Target`,
    icon: 'IconBuildingSkyscraper',
    isNullable: false,
    type: FieldMetadataType.RELATION,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectConfig,
      fieldName: 'taskTargets',
    }),
    relationTargetFieldMetadataUniversalIdentifier:
      'f5a92df0-a2db-4629-8bb8-ae7387765e22',
    relationTargetObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.taskTarget.universalIdentifier,
  };

  return [timelineActivities, favorites, attachments, noteTargets, taskTargets];
};
