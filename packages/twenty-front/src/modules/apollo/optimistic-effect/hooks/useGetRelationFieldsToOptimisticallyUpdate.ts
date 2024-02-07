import { useRecoilCallback } from 'recoil';

import { TriggerUpdateRelationFieldOptimisticEffectParams } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationFieldOptimisticEffect';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useGetRelationFieldsToOptimisticallyUpdate = () =>
  useRecoilCallback(
    ({ snapshot }) =>
      <UpdatedObjectRecord extends ObjectRecord = ObjectRecord>({
        cachedRecord,
        objectMetadataItem,
        updateRecordInput,
      }: {
        cachedRecord: UpdatedObjectRecord & { __typename: string };
        objectMetadataItem: ObjectMetadataItem;
        updateRecordInput: Partial<Omit<UpdatedObjectRecord, 'id'>>;
      }) =>
        Object.entries(updateRecordInput).reduce<
          Pick<
            TriggerUpdateRelationFieldOptimisticEffectParams,
            | 'relationObjectMetadataNameSingular'
            | 'relationFieldName'
            | 'previousRelationRecord'
            | 'nextRelationRecord'
          >[]
        >((result, [fieldName, nextRelationRecord]) => {
          const fieldDefinition = objectMetadataItem.fields.find(
            (fieldMetadataItem) => fieldMetadataItem.name === fieldName,
          );

          if (fieldDefinition?.type !== FieldMetadataType.Relation)
            return result;

          const relationObjectMetadataNameSingular = (
            fieldDefinition.toRelationMetadata?.fromObjectMetadata ||
            fieldDefinition.fromRelationMetadata?.toObjectMetadata
          )?.nameSingular;
          const relationFieldMetadataId =
            fieldDefinition.toRelationMetadata?.fromFieldMetadataId ||
            fieldDefinition.fromRelationMetadata?.toFieldMetadataId;

          if (!relationObjectMetadataNameSingular || !relationFieldMetadataId)
            return result;

          const relationObjectMetadataItem = snapshot
            .getLoadable(
              objectMetadataItemFamilySelector({
                objectName: relationObjectMetadataNameSingular,
                objectNameType: 'singular',
              }),
            )
            .valueOrThrow();

          if (!relationObjectMetadataItem) return result;

          const relationFieldName = relationObjectMetadataItem.fields.find(
            (fieldMetadataItem) =>
              fieldMetadataItem.id === relationFieldMetadataId,
          )?.name;

          if (!relationFieldName) return result;

          return [
            ...result,
            {
              relationObjectMetadataNameSingular,
              relationFieldName,
              previousRelationRecord: cachedRecord[fieldName],
              nextRelationRecord,
            },
          ];
        }, []),
  );
