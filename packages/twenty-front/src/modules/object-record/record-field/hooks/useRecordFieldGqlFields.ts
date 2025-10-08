import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { generateDepthOneWithoutRelationsRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneWithoutRelationsRecordGqlFields';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { FieldMetadataType } from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

export const useRecordFieldGqlFields = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
  );

  const { fieldMetadataItemByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();

  const { objectMetadataItem: noteTargetObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.NoteTarget,
    });

  const { objectMetadataItem: taskTargetObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.TaskTarget,
    });

  const allDepthOneWithoutRelationsRecordGqlFields =
    generateDepthOneWithoutRelationsRecordGqlFields({
      objectMetadataItem,
    });

  const gqlFieldsList: RecordGqlFields = Object.fromEntries(
    visibleRecordFields.flatMap(
      (recordField): [string, boolean | RecordGqlFields][] => {
        const fieldMetadataItem: FieldMetadataItem | undefined =
          fieldMetadataItemByFieldMetadataItemId[
            recordField.fieldMetadataItemId
          ];

        if (!isDefined(fieldMetadataItem)) {
          throw new Error(
            `Field ${recordField.fieldMetadataItemId} is missing, please refresh the page. If the problem persists, please contact support.`,
          );
        }

        // TODO: remove this once we have made the workflowVersion lighter
        if (
          fieldMetadataItem.name === 'versions' ||
          fieldMetadataItem.name === 'workflowVersion'
        ) {
          return [[fieldMetadataItem.name, { id: true, name: true }]];
        }

        const isMorphRelation =
          fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION;

        if (!isMorphRelation) {
          return [[fieldMetadataItem.name, true]];
        }

        if (!isDefined(fieldMetadataItem.morphRelations)) {
          throw new Error(
            `Field ${fieldMetadataItem.name} is missing, please refresh the page. If the problem persists, please contact support.`,
          );
        }

        return fieldMetadataItem.morphRelations.map((morphRelation) => {
          const computedFieldName = computeMorphRelationFieldName({
            fieldName: fieldMetadataItem.name,
            relationType: fieldMetadataItem.settings?.relationType,
            targetObjectMetadataNameSingular:
              morphRelation.targetObjectMetadata.nameSingular,
            targetObjectMetadataNamePlural:
              morphRelation.targetObjectMetadata.namePlural,
          });

          return [computedFieldName, true];
        });
      },
    ),
  );

  return {
    ...allDepthOneWithoutRelationsRecordGqlFields,
    ...gqlFieldsList,
    noteTargets: generateDepthOneRecordGqlFields({
      objectMetadataItem: noteTargetObjectMetadataItem,
    }),
    taskTargets: generateDepthOneRecordGqlFields({
      objectMetadataItem: taskTargetObjectMetadataItem,
    }),
  };
};
