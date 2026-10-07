import { randomUUID } from 'node:crypto';

import { printTypescriptValue } from '@/app/pull/print-typescript-value';
import {
  FieldMetadataType,
  type RelationOnDeleteAction,
  type RelationType,
} from 'twenty-shared/types';

export const getFieldBaseFile = ({
  data,
}: {
  data: {
    name: string;
    label: string;
    type: FieldMetadataType;
    objectUniversalIdentifier: string;
    description?: string;
    relationTargetObjectMetadataUniversalIdentifier?: string;
    relationTargetFieldMetadataUniversalIdentifier?: string;
    relationType?: RelationType;
    onDelete?: RelationOnDeleteAction | 'None';
  };
  name: string;
}) => {
  const universalIdentifier = randomUUID();
  const descriptionLine = data.description
    ? `\n  description: ${printTypescriptValue({ value: data.description })},`
    : '';

  const isRelation =
    data.type === FieldMetadataType.RELATION ||
    data.type === FieldMetadataType.MORPH_RELATION;

  if (isRelation) {
    const hasOnDelete = data.onDelete && data.onDelete !== 'None';
    const importLine = `import { defineField, FieldType, RelationType${
      hasOnDelete ? ', OnDeleteAction' : ''
    } } from 'twenty-sdk/define';`;
    const onDeleteSetting = hasOnDelete
      ? `, onDelete: OnDeleteAction.${data.onDelete}`
      : '';
    const morphIdLine =
      data.type === FieldMetadataType.MORPH_RELATION
        ? `\n  morphId: '${randomUUID()}',`
        : '';

    return `${importLine}

export default defineField({
  universalIdentifier: '${universalIdentifier}',
  name: ${printTypescriptValue({ value: data.name })},
  label: ${printTypescriptValue({ value: data.label })},
  type: FieldType.${data.type},
  objectUniversalIdentifier: ${printTypescriptValue({ value: data.objectUniversalIdentifier })},
  relationTargetObjectMetadataUniversalIdentifier: ${printTypescriptValue({ value: data.relationTargetObjectMetadataUniversalIdentifier })},
  relationTargetFieldMetadataUniversalIdentifier: ${printTypescriptValue({ value: data.relationTargetFieldMetadataUniversalIdentifier })},
  universalSettings: { relationType: RelationType.${data.relationType}${onDeleteSetting} },${morphIdLine}${descriptionLine}
});
`;
  }

  return `import { defineField, FieldType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '${universalIdentifier}',
  name: ${printTypescriptValue({ value: data.name })},
  label: ${printTypescriptValue({ value: data.label })},
  type: FieldType.${data.type},
  objectUniversalIdentifier: ${printTypescriptValue({ value: data.objectUniversalIdentifier })},${descriptionLine}
});
`;
};
