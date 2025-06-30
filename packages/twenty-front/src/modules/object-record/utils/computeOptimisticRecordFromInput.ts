import { isNull, isUndefined } from '@sniptt/guards';

import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  getRecordFromCache,
  GetRecordFromCacheArgs,
} from '@/object-record/cache/utils/getRecordFromCache';
import { GRAPHQL_TYPENAME_KEY } from '@/object-record/constants/GraphqlTypenameKey';
import { FieldActorValue } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldActor } from '@/object-record/record-field/types/guards/isFieldActor';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { isFieldUuid } from '@/object-record/record-field/types/guards/isFieldUuid';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { buildOptimisticActorFieldValueFromCurrentWorkspaceMember } from '@/object-record/utils/buildOptimisticActorFieldValueFromCurrentWorkspaceMember';
import { getForeignKeyNameFromRelationFieldName } from '@/object-record/utils/getForeignKeyNameFromRelationFieldName';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type ComputeOptimisticCacheRecordInputArgs = {
  objectMetadataItem: ObjectMetadataItem;
  recordInput: Partial<ObjectRecord>;
  currentWorkspaceMember: CurrentWorkspaceMember | null;
} & Pick<
  GetRecordFromCacheArgs,
  'cache' | 'objectMetadataItems' | 'objectPermissionsByObjectMetadataId'
>;
export const computeOptimisticRecordFromInput = ({
  objectMetadataItem,
  recordInput,
  cache,
  objectMetadataItems,
  currentWorkspaceMember,
  objectPermissionsByObjectMetadataId,
}: ComputeOptimisticCacheRecordInputArgs) => {
  const unknownRecordInputFields = Object.keys(recordInput).filter(
    (recordKey) => {
      const correspondingFieldMetadataItem = objectMetadataItem.fields.find(
        (field) => field.name === recordKey,
      );

      const potentialJoinColumnNameFieldMetadataItem =
        objectMetadataItem.fields.find(
          (field) =>
            field.type === FieldMetadataType.RELATION &&
            field.settings?.joinColumnName === recordKey,
        );

      const isUnknownField =
        !isDefined(correspondingFieldMetadataItem) &&
        !isDefined(potentialJoinColumnNameFieldMetadataItem);

      const isTypenameField = recordKey === GRAPHQL_TYPENAME_KEY;
      return isUnknownField && !isTypenameField;
    },
  );
  if (unknownRecordInputFields.length > 0) {
    throw new Error(
      `Should never occur, encountered unknown fields ${unknownRecordInputFields.join(', ')} in objectMetadataItem ${objectMetadataItem.nameSingular}`,
    );
  }

  const optimisticRecord: Partial<ObjectRecord> = {};
  for (const fieldMetadataItem of objectMetadataItem.fields) {
    const recordInputFieldValue: unknown = recordInput[fieldMetadataItem.name];

    if (isFieldUuid(fieldMetadataItem)) {
      const isRelationFieldId = objectMetadataItem.fields.some(
        ({ type, relation }) => {
          if (type !== FieldMetadataType.RELATION) {
            return false;
          }

          if (!isDefined(relation)) {
            return false;
          }

          const sourceFieldName = relation.sourceFieldMetadata.name;
          return (
            getForeignKeyNameFromRelationFieldName(sourceFieldName) ===
            fieldMetadataItem.name
          );
        },
      );

      if (isRelationFieldId) {
        continue;
      }
    }

    if (isFieldActor(fieldMetadataItem) && isDefined(recordInputFieldValue)) {
      const defaultActorFieldValue =
        buildOptimisticActorFieldValueFromCurrentWorkspaceMember(
          currentWorkspaceMember,
        );
      optimisticRecord[fieldMetadataItem.name] = {
        ...defaultActorFieldValue,
        ...(recordInputFieldValue as FieldActorValue),
      };
      continue;
    }

    const isRelationField = isFieldRelation(fieldMetadataItem);
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

    if (fieldMetadataItem.relation?.type === RelationType.ONE_TO_MANY) {
      continue;
    }

    const isManyToOneRelation =
      fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE;
    if (!isManyToOneRelation) {
      continue;
    }

    if (!isUndefined(recordInputFieldValue)) {
      throw new Error(
        `Should never provide relation mutation through anything else than the fieldId e.g companyId and not company, encountered: ${fieldMetadataItem.name}`,
      );
    }

    const relationFieldIdName = getForeignKeyNameFromRelationFieldName(
      fieldMetadataItem.name,
    );

    const recordInputFieldIdValue: string | null | undefined =
      recordInput[relationFieldIdName];

    if (isUndefined(recordInputFieldIdValue)) {
      continue;
    }

    const relationIdFieldMetadataItem = objectMetadataItem.fields.find(
      (field) => field.name === relationFieldIdName,
    );

    if (
      !isDefined(relationIdFieldMetadataItem) &&
      !isDefined(fieldMetadataItem.settings?.joinColumnName)
    ) {
      throw new Error(
        'Should never occur, encountered unknown relationId within relations definitions',
      );
    }

    if (isNull(recordInputFieldIdValue)) {
      optimisticRecord[relationFieldIdName] = null;
      optimisticRecord[fieldMetadataItem.name] = null;
      continue;
    }

    const targetNameSingular =
      fieldMetadataItem.relation?.targetObjectMetadata.nameSingular;
    const targetObjectMetataDataItem = objectMetadataItems.find(
      ({ nameSingular }) => nameSingular === targetNameSingular,
    );
    if (!isDefined(targetObjectMetataDataItem)) {
      throw new Error(
        'Should never occur, encountered invalid relation definition',
      );
    }

    const cachedRecord = getRecordFromCache({
      cache,
      objectMetadataItem: targetObjectMetataDataItem,
      objectMetadataItems,
      recordId: recordInputFieldIdValue as string,
      objectPermissionsByObjectMetadataId,
    });

    optimisticRecord[relationFieldIdName] = recordInputFieldIdValue;

    if (!isDefined(cachedRecord) || Object.keys(cachedRecord).length <= 0) {
      continue;
    }

    optimisticRecord[fieldMetadataItem.name] = cachedRecord;
  }

  return optimisticRecord;
};
