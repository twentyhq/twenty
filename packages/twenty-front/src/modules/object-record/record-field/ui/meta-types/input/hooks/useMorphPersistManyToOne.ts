import { useRecoilCallback } from 'recoil';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { buildRecordWithAllMorphObjectIdsToNull } from '@/object-record/record-field/ui/meta-types/input/utils/buildRecordWithAllMorphObjectIdsToNull';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

export type MorphPersistManyToOneProps = {
  objectMetadataNameSingular: string;
};

export const useMorphPersistManyToOne = ({
  objectMetadataNameSingular,
}: MorphPersistManyToOneProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const { updateOneRecord } = useUpdateOneRecord();

  const persistMorphManyToOne = useRecoilCallback(
    ({ snapshot }) =>
      async ({
        recordId,
        fieldDefinition,
        valueToPersist,
        targetObjectMetadataNameSingular,
      }: {
        recordId: string;
        fieldDefinition: FieldDefinition<FieldMetadata>;
        valueToPersist: string | null | undefined;
        targetObjectMetadataNameSingular?: string;
      }) => {
        assertFieldMetadata(
          FieldMetadataType.MORPH_RELATION,
          isFieldMorphRelation,
          fieldDefinition,
        );

        const fieldName = fieldDefinition.metadata.fieldName;

        if (!isDefined(valueToPersist)) {
          const recordWithAllMorphObjectIdsToNull =
            buildRecordWithAllMorphObjectIdsToNull({
              morphRelations: fieldDefinition.metadata.morphRelations,
              fieldName,
              relationType: fieldDefinition.metadata.relationType,
            });

          updateOneRecord?.({
            objectNameSingular: objectMetadataNameSingular,
            idToUpdate: recordId,
            updateOneRecordInput: recordWithAllMorphObjectIdsToNull,
          });

          return;
        }

        const targetObjectMetadataItem = objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.nameSingular ===
            targetObjectMetadataNameSingular,
        );

        if (!isDefined(targetObjectMetadataItem)) {
          throw new Error('Object metadata item not found');
        }

        const computedFieldName = computeMorphRelationFieldName({
          fieldName,
          relationType: fieldDefinition.metadata.relationType,
          targetObjectMetadataNameSingular:
            targetObjectMetadataItem.nameSingular,
          targetObjectMetadataNamePlural: targetObjectMetadataItem.namePlural,
        });

        const currentValue: unknown = snapshot
          .getLoadable(
            recordStoreFamilySelector({
              recordId,
              fieldName: computedFieldName,
            }),
          )
          .getValue();

        if (
          isDefined(currentValue) &&
          (currentValue as ObjectRecord).id === valueToPersist
        ) {
          return;
        }

        const recordWithAllMorphObjectIdsToNull =
          buildRecordWithAllMorphObjectIdsToNull({
            morphRelations: fieldDefinition.metadata.morphRelations,
            fieldName,
            relationType: fieldDefinition.metadata.relationType,
          });

        updateOneRecord({
          objectNameSingular: objectMetadataNameSingular,
          idToUpdate: recordId,
          updateOneRecordInput: {
            ...recordWithAllMorphObjectIdsToNull,
            [`${computedFieldName}Id`]: valueToPersist,
          },
        });

        return;
      },
    [objectMetadataItems, updateOneRecord, objectMetadataNameSingular],
  );

  return { persistMorphManyToOne };
};
