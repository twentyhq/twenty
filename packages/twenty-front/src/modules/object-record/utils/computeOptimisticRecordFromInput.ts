import { isNull, isUndefined } from '@sniptt/guards';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  getRecordFromCache,
  GetRecordFromCacheArgs,
} from '@/object-record/cache/utils/getRecordFromCache';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { isFieldUuid } from '@/object-record/record-field/types/guards/isFieldUuid';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { RelationDefinitionType } from '~/generated-metadata/graphql';
import { FieldMetadataType } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

// We're not strict checking that any key within recordInput exists in the objectMetadaItem //TODO IN THE TRAIN
type ComputeOptimisticCacheRecordInputArgs = {
  objectMetadataItem: ObjectMetadataItem;
  recordInput: Partial<ObjectRecord>;
} & Pick<GetRecordFromCacheArgs, 'cache' | 'objectMetadataItems'>;
export const computeOptimisticRecordFromInput = ({
  objectMetadataItem,
  recordInput,
  cache,
  objectMetadataItems,
}: ComputeOptimisticCacheRecordInputArgs) => {
  const optimisticRecord: Partial<ObjectRecord> = {};
  for (const fieldMetadataItem of objectMetadataItem.fields) {
    if (isFieldUuid(fieldMetadataItem)) {
      const isRelationFieldId = objectMetadataItem.fields.some(
        ({ type, relationDefinition }) => {
          if (type !== FieldMetadataType.RELATION) {
            return false;
          }

          if (!isDefined(relationDefinition)) {
            return false;
          }

          const sourceFieldName = relationDefinition.sourceFieldMetadata.name;
          return `${sourceFieldName}Id` === fieldMetadataItem.name;
        },
      );

      if (isRelationFieldId) {
        continue;
      }
    }

    const isRelationField = isFieldRelation(fieldMetadataItem);
    const recordInputFieldValue: unknown = recordInput[fieldMetadataItem.name];
    if (!isRelationField) {
      if (!isDefined(recordInputFieldValue)) {
        continue;
      }

      if (!fieldMetadataItem.isNullable && recordInputFieldValue == null) {
        continue;
      }

      optimisticRecord[fieldMetadataItem.name] = recordInputFieldValue;
      continue;
    }

    if (
      fieldMetadataItem.relationDefinition?.direction ===
      RelationDefinitionType.ONE_TO_MANY
    ) {
      continue;
    }

    const isManyToOneRelation =
      fieldMetadataItem.relationDefinition?.direction ===
      RelationDefinitionType.MANY_TO_ONE;
    if (!isManyToOneRelation) {
      continue;
    }

    if (isDefined(recordInputFieldValue) && isRelationField) {
      throw new Error(
        'Should never provide relation mutation through anything else than the fieldId e.g companyId',
      );
    }

    const relationFieldIdName = `${fieldMetadataItem.name}Id`;
    const recordInputFieldIdValue: unknown = recordInput[relationFieldIdName];
    if (isUndefined(recordInputFieldIdValue)) {
      continue;
    }

    const relationIdFieldMetadataItem = objectMetadataItem.fields.find(
      (field) => field.name === relationFieldIdName,
    );
    if (!isDefined(relationIdFieldMetadataItem)) {
      throw new Error(
        'Should never occur, encountered unknown relationId within relations definitions',
      );
    }

    const isRecordInputFieldIdNull = isNull(recordInputFieldIdValue);
    if (isRecordInputFieldIdNull) {
      optimisticRecord[relationFieldIdName] = null;
      optimisticRecord[fieldMetadataItem.name] = null;
      continue;
    }

    const targetNameSingular =
      fieldMetadataItem.relationDefinition?.targetObjectMetadata.nameSingular;
    const targetObjectMetataDataItem = objectMetadataItems.find(
      ({ nameSingular }) => nameSingular === targetNameSingular,
    );
    if (
      !isDefined(targetNameSingular) ||
      !isDefined(targetObjectMetataDataItem)
    ) {
      throw new Error(
        'Should never occur, encountered invalid relation definition',
      );
    }

    const cachedRecord = getRecordFromCache({
      cache,
      objectMetadataItem: targetObjectMetataDataItem,
      objectMetadataItems,
      recordId: recordInputFieldIdValue as string,
    });
    if (!isDefined(cachedRecord) || Object.keys(cachedRecord).length <= 0) {
      continue;
    } else {
      optimisticRecord[relationFieldIdName] = recordInputFieldIdValue;
      optimisticRecord[fieldMetadataItem.name] = cachedRecord;
    }
  }

  return optimisticRecord;
};
