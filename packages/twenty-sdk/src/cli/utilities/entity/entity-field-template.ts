import {
  FieldMetadataType,
  type RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

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
  const universalIdentifier = v4();
  const descriptionLine = data.description
    ? `\n  description: '${data.description}',`
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
    // The manifest build rejects a MANY_TO_ONE relation without a join column.
    const joinColumnNameSetting =
      data.relationType === RelationType.MANY_TO_ONE
        ? `, joinColumnName: '${data.name}Id'`
        : '';
    const morphIdLine =
      data.type === FieldMetadataType.MORPH_RELATION
        ? `\n  morphId: '${v4()}',`
        : '';

    return `${importLine}

export default defineField({
  universalIdentifier: '${universalIdentifier}',
  name: '${data.name}',
  label: '${data.label}',
  type: FieldType.${data.type},
  objectUniversalIdentifier: '${data.objectUniversalIdentifier}',
  relationTargetObjectMetadataUniversalIdentifier: '${data.relationTargetObjectMetadataUniversalIdentifier}',
  relationTargetFieldMetadataUniversalIdentifier: '${data.relationTargetFieldMetadataUniversalIdentifier}',
  universalSettings: { relationType: RelationType.${data.relationType}${onDeleteSetting}${joinColumnNameSetting} },${morphIdLine}${descriptionLine}
});
`;
  }

  return `import { defineField, FieldType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '${universalIdentifier}',
  name: '${data.name}',
  label: '${data.label}',
  type: FieldType.${data.type},
  objectUniversalIdentifier: '${data.objectUniversalIdentifier}',${descriptionLine}
});
`;
};
