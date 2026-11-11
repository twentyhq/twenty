import { FieldMetadataType } from 'twenty-shared/types';
import { computeMorphRelationGqlFieldName } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RelationType } from '~/generated-metadata/graphql';

type ValidationRuleToOneRelationTarget = {
  name: string;
  targetObjectMetadataId: string;
  isMorphTarget: boolean;
};

// A morph relation reads each of its targets as its own relation (targetCompany, targetPerson)
export const getValidationRuleToOneRelationTargets = (
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'name' | 'type' | 'relation' | 'morphRelations'
  >,
): ValidationRuleToOneRelationTarget[] => {
  if (fieldMetadataItem.type === FieldMetadataType.RELATION) {
    const relation = fieldMetadataItem.relation;

    return relation?.type === RelationType.MANY_TO_ONE
      ? [
          {
            name: fieldMetadataItem.name,
            targetObjectMetadataId: relation.targetObjectMetadata.id,
            isMorphTarget: false,
          },
        ]
      : [];
  }

  if (fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION) {
    return [];
  }

  return (fieldMetadataItem.morphRelations ?? [])
    .filter((morphRelation) => morphRelation.type === RelationType.MANY_TO_ONE)
    .map((morphRelation) => ({
      name: computeMorphRelationGqlFieldName({
        fieldName: fieldMetadataItem.name,
        relationType: morphRelation.type,
        targetObjectMetadataNameSingular:
          morphRelation.targetObjectMetadata.nameSingular,
        targetObjectMetadataNamePlural:
          morphRelation.targetObjectMetadata.namePlural,
      }),
      targetObjectMetadataId: morphRelation.targetObjectMetadata.id,
      isMorphTarget: true,
    }));
};
