import { useRecoilCallback } from 'recoil';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';

import { useUpdateOneRecordV2 } from '@/object-record/hooks/useUpdateOneRecordV2';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
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

  const { updateOneRecord } = useUpdateOneRecordV2();

  const persistMorphManyToOne = useRecoilCallback(
    ({ set, snapshot }) =>
      async ({
        recordId,
        fieldDefinition,
        valueToPersist,
        targetObjectMetadataNameSingular,
      }: {
        recordId: string;
        fieldDefinition: FieldDefinition<FieldMetadata>;
        valueToPersist: string | null | undefined;
        targetObjectMetadataNameSingular: string;
      }) => {
        assertFieldMetadata(
          FieldMetadataType.MORPH_RELATION,
          isFieldMorphRelation,
          fieldDefinition,
        );
        const targetObjectMetadataItem = objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.nameSingular ===
            targetObjectMetadataNameSingular,
        );

        if (!isDefined(targetObjectMetadataItem)) {
          throw new Error('Object metadata item not found');
        }

        const fieldName = fieldDefinition.metadata.fieldName;

        if (!isDefined(valueToPersist)) {
          // Handle detach
          return;
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

        // TODO @guillim: useUpdateMany to avoid makeing several calls to the server
        fieldDefinition.metadata.morphRelations.forEach((morphRelation) => {
          const resetMorphOneRecordInput: Record<string, string | null> = {};
          const computedFieldName = computeMorphRelationFieldName({
            fieldName,
            relationType: fieldDefinition.metadata.relationType,
            targetObjectMetadataNameSingular:
              morphRelation.targetObjectMetadata.nameSingular,
            targetObjectMetadataNamePlural:
              morphRelation.targetObjectMetadata.namePlural,
          });
          resetMorphOneRecordInput[`${computedFieldName}Id`] = null;
          updateOneRecord?.({
            objectNameSingular: objectMetadataNameSingular,
            idToUpdate: recordId,
            updateOneRecordInput: resetMorphOneRecordInput,
          });
        });

        updateOneRecord?.({
          objectNameSingular: objectMetadataNameSingular,
          idToUpdate: recordId,
          updateOneRecordInput: {
            [`${computedFieldName}Id`]: valueToPersist,
          },
        });

        set(
          recordStoreFamilySelector({
            recordId,
            fieldName: computedFieldName,
          }),
          valueToPersist,
        );
        return;
      },
    [updateOneRecord, objectMetadataItems, objectMetadataNameSingular],
  );

  return { persistMorphManyToOne };
};
