import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { generateDepthOneWithoutRelationsRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneWithoutRelationsRecordGqlFields';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import * as Sentry from '@sentry/react';
import { FieldMetadataType } from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

export const useRecordTableRecordGqlFields = ({
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

  const gqlFieldsList = Object.fromEntries(
    visibleRecordFields.flatMap((recordField) => {
      const fieldMetadataItem =
        fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId];

      if (!isDefined(fieldMetadataItem)) {
        Sentry.captureMessage(
          `Field metadata item not found for record field ${recordField.id} and fieldMetadataItem id ${recordField.fieldMetadataItemId}, this should not happen, is it a stale view field due to a recent migration ?`,
          {
            level: 'error',
          },
        );
        return [];
      }

      const isMorphRelation =
        fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION;

      if (!isMorphRelation) {
        return [[fieldMetadataItem.name, true]];
      }

      if (!isDefined(fieldMetadataItem.morphRelations)) {
        Sentry.captureMessage(
          `Morph relations not found for fieldMetadataItem ${fieldMetadataItem.name}, this should not happen.`,
          {
            level: 'error',
          },
        );
        return [];
      }

      return fieldMetadataItem.morphRelations.map((morphRelation) => [
        computeMorphRelationFieldName({
          fieldName: fieldMetadataItem.name,
          relationDirection: morphRelation.type,
          nameSingular: morphRelation.targetObjectMetadata.nameSingular,
          namePlural: morphRelation.targetObjectMetadata.namePlural,
        }),
        true,
      ]);
    }),
  );

  const recordGqlFields: Record<string, any> = {
    ...allDepthOneWithoutRelationsRecordGqlFields,
    ...gqlFieldsList,
    noteTargets: generateDepthOneRecordGqlFields({
      objectMetadataItem: noteTargetObjectMetadataItem,
    }),
    taskTargets: generateDepthOneRecordGqlFields({
      objectMetadataItem: taskTargetObjectMetadataItem,
    }),
  };

  return recordGqlFields;
};
