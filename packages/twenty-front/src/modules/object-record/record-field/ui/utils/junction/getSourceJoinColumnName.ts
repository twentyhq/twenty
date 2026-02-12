import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getJoinColumnName';
import { FieldMetadataType } from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

type GetSourceJoinColumnNameArgs = {
  sourceField: Pick<FieldMetadataItem, 'type' | 'morphRelations' | 'settings'>;
  sourceObjectMetadata: Pick<
    ObjectMetadataItem,
    'id' | 'nameSingular' | 'namePlural'
  >;
};

export const getSourceJoinColumnName = ({
  sourceField,
  sourceObjectMetadata,
}: GetSourceJoinColumnNameArgs): string | undefined => {
  if (sourceField.type === FieldMetadataType.MORPH_RELATION) {
    const morphRelation = sourceField.morphRelations?.find(
      (mr) => mr.targetObjectMetadata.id === sourceObjectMetadata.id,
    );

    if (!isDefined(morphRelation)) {
      return undefined;
    }

    const computedFieldName = computeMorphRelationFieldName({
      fieldName: morphRelation.sourceFieldMetadata.name,
      relationType: morphRelation.type,
      targetObjectMetadataNameSingular: sourceObjectMetadata.nameSingular,
      targetObjectMetadataNamePlural: sourceObjectMetadata.namePlural,
    });

    return `${computedFieldName}Id`;
  }

  return getJoinColumnName(sourceField.settings);
};
