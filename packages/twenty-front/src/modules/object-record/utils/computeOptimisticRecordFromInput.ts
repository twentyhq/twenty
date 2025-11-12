import { isNull, isUndefined } from '@sniptt/guards';

import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getFieldMetadataFromGqlField } from '@/object-record/cache/utils/getFieldMetadataFromGqlField';
import { getMorphRelationFromFieldMetadataAndGqlField } from '@/object-record/cache/utils/getMorphRelationFromFieldMetadataAndGqlField';
import {
  getRecordFromCache,
  type GetRecordFromCacheArgs,
} from '@/object-record/cache/utils/getRecordFromCache';
import { GRAPHQL_TYPENAME_KEY } from '@/object-record/constants/GraphqlTypenameKey';
import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldActor } from '@/object-record/record-field/ui/types/guards/isFieldActor';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isFieldUuid } from '@/object-record/record-field/ui/types/guards/isFieldUuid';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { buildOptimisticActorFieldValueFromCurrentWorkspaceMember } from '@/object-record/utils/buildOptimisticActorFieldValueFromCurrentWorkspaceMember';
import { getForeignKeyNameFromRelationFieldName } from '@/object-record/utils/getForeignKeyNameFromRelationFieldName';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';
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

      const potentialRelationJoinColumnNameFieldMetadataItem =
        objectMetadataItem.fields.find(
          (field) =>
            field.type === FieldMetadataType.RELATION &&
            field.settings?.joinColumnName === recordKey,
        );

      const potentialMorphRelationJoinColumnNameFieldMetadataItem =
        objectMetadataItem.fields.find((field) => {
          if (!isFieldMorphRelation(field)) return false;

          return getFieldMetadataFromGqlField({
            objectMetadataItem,
            gqlField: recordKey,
          });
        });

      const isUnknownField =
        !isDefined(correspondingFieldMetadataItem) &&
        !isDefined(potentialRelationJoinColumnNameFieldMetadataItem) &&
        !isDefined(potentialMorphRelationJoinColumnNameFieldMetadataItem);

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
    const isMorphRelationField = isFieldMorphRelation(fieldMetadataItem);
    if (!isRelationField && !isMorphRelationField) {
      if (!isDefined(recordInputFieldValue)) {
        continue;
      }

      if (!fieldMetadataItem.isNullable && recordInputFieldValue == null) {
        continue;
      }

      optimisticRecord[fieldMetadataItem.name] = recordInputFieldValue;
      continue;
    }

    if (isRelationField) {
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

      const relationGqlFieldWithId = getForeignKeyNameFromRelationFieldName(
        fieldMetadataItem.name,
      );

      const recordInputFieldIdValue: string | null | undefined =
        recordInput[relationGqlFieldWithId];

      if (isUndefined(recordInputFieldIdValue)) {
        continue;
      }

      if (isNull(recordInputFieldIdValue)) {
        optimisticRecord[relationGqlFieldWithId] = null;
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

      optimisticRecord[relationGqlFieldWithId] = recordInputFieldIdValue;

      if (!isDefined(cachedRecord) || Object.keys(cachedRecord).length <= 0) {
        continue;
      }

      optimisticRecord[fieldMetadataItem.name] = cachedRecord;
    }

    if (isMorphRelationField) {
      const relationType = fieldMetadataItem.settings?.relationType;
      if (relationType === RelationType.ONE_TO_MANY) {
        continue;
      }

      const isManyToOneRelation = relationType === RelationType.MANY_TO_ONE;
      if (!isManyToOneRelation) {
        continue;
      }

      if (!isUndefined(recordInputFieldValue)) {
        throw new Error(
          `Should never provide relation mutation through anything else than the fieldId e.g companyId and not company, encountered: ${fieldMetadataItem.name}`,
        );
      }

      const relationGqlFields = fieldMetadataItem.morphRelations?.map(
        (morphRelation) => {
          return computeMorphRelationFieldName({
            fieldName: fieldMetadataItem.name,
            relationType,
            targetObjectMetadataNameSingular:
              morphRelation.targetObjectMetadata.nameSingular,
            targetObjectMetadataNamePlural:
              morphRelation.targetObjectMetadata.namePlural,
          });
        },
      );

      const relationGqlField = relationGqlFields?.find(
        (relationGqlField) => recordInput[`${relationGqlField}Id`],
      );

      const relationGqlFieldWithId = `${relationGqlField}Id`;

      if (isUndefined(relationGqlField)) {
        continue;
      }

      const recordInputFieldIdValue: string | null | undefined =
        recordInput[relationGqlFieldWithId];

      if (isUndefined(recordInputFieldIdValue)) {
        continue;
      }

      if (isNull(recordInputFieldIdValue)) {
        optimisticRecord[relationGqlField] = null;
        optimisticRecord[fieldMetadataItem.name] = null;
        continue;
      }

      if (!isDefined(fieldMetadataItem.morphRelations)) {
        throw new Error(
          'Should never occur, encountered invalid relation definition',
        );
      }

      const fieldMetadataMorphRelation =
        getMorphRelationFromFieldMetadataAndGqlField({
          objectMetadataItems,
          fieldMetadata: { morphRelations: fieldMetadataItem.morphRelations },
          gqlField: relationGqlField,
        });

      if (!isDefined(fieldMetadataMorphRelation?.targetObjectMetadata)) {
        throw new Error(
          'Should never occur, encountered invalid relation definition',
        );
      }

      const cachedRecord = getRecordFromCache({
        cache,
        objectMetadataItem: fieldMetadataMorphRelation.targetObjectMetadata,
        objectMetadataItems,
        recordId: recordInputFieldIdValue as string,
        objectPermissionsByObjectMetadataId,
      });

      optimisticRecord[relationGqlFieldWithId] = recordInputFieldIdValue;

      if (!isDefined(cachedRecord) || Object.keys(cachedRecord).length <= 0) {
        continue;
      }

      optimisticRecord[relationGqlField] = cachedRecord;
    }
  }

  return optimisticRecord;
};
