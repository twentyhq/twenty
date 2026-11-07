import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import {
  computeMorphRelationGqlFieldName,
  computeRelationGqlFieldJoinColumnName,
} from 'twenty-shared/utils';
import {
  buildWorkflowRecordKeysByFieldReference,
  type WorkflowRecordFieldReferenceSource,
} from 'twenty-shared/workflow';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type WorkflowRecordFieldMetadata = Pick<
  FieldMetadataItem,
  'name' | 'type' | 'settings'
> & {
  morphRelations?:
    | Pick<FieldMetadataItemRelation, 'targetObjectMetadata'>[]
    | null;
};

const toManyToOneRelationSource = ({
  name,
  morphName,
}: {
  name: string;
  morphName?: string;
}): WorkflowRecordFieldReferenceSource => ({
  name,
  manyToOneRelation: {
    joinColumnName: computeRelationGqlFieldJoinColumnName({ name }),
    morphName,
  },
});

export const getWorkflowRecordKeysByFieldReference = (objectMetadataItem: {
  fields: WorkflowRecordFieldMetadata[];
}): Map<string, string[]> =>
  buildWorkflowRecordKeysByFieldReference(
    objectMetadataItem.fields.flatMap(
      (field): WorkflowRecordFieldReferenceSource[] => {
        const isManyToOne =
          field.settings?.relationType === RelationType.MANY_TO_ONE;

        if (field.type === FieldMetadataType.MORPH_RELATION) {
          return (field.morphRelations ?? []).map(
            ({ targetObjectMetadata }) => {
              const targetFieldName = computeMorphRelationGqlFieldName({
                fieldName: field.name,
                relationType: field.settings?.relationType,
                targetObjectMetadataNameSingular:
                  targetObjectMetadata.nameSingular,
                targetObjectMetadataNamePlural: targetObjectMetadata.namePlural,
              });

              return isManyToOne
                ? toManyToOneRelationSource({
                    name: targetFieldName,
                    morphName: field.name,
                  })
                : { name: targetFieldName };
            },
          );
        }

        return field.type === FieldMetadataType.RELATION && isManyToOne
          ? [toManyToOneRelationSource({ name: field.name })]
          : [{ name: field.name }];
      },
    ),
  );
