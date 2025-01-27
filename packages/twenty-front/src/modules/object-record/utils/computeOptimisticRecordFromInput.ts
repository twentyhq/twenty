import { isNull, isString } from '@sniptt/guards';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { RelationDefinitionType } from '~/generated-metadata/graphql';
import { FieldMetadataType } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { getUrlHostName } from '~/utils/url/getUrlHostName';
type ComputeOptimisticCacheRecordInputArgs = {
  objectMetadataItem: ObjectMetadataItem;
  recordInput: Partial<ObjectRecord>;
};
// TODO refactor everything here my dude
export const computeOptimisticRecordFromInput = ({
  objectMetadataItem,
  recordInput,
}: ComputeOptimisticCacheRecordInputArgs) => {
  console.log({ recordInput });
  const recordInputEntries = Object.entries<Partial<ObjectRecord>>(recordInput);
  const sanitizedEntries = objectMetadataItem.fields.flatMap(
    (fieldMetadataItem) => {
      const isRelationField =
        fieldMetadataItem.type === FieldMetadataType.RELATION;

      const recordInputMatch = recordInputEntries.find(
        ([fieldName]) => fieldName === fieldMetadataItem.name,
      );
      if (isDefined(recordInputMatch) && isRelationField) {
        throw new Error("Should never provide relation mutation through anything else than the fieldId e.g companyId");
      }

      if (
        isRelationField &&
        fieldMetadataItem.relationDefinition?.direction ===
          RelationDefinitionType.ONE_TO_MANY
      ) {
        return [];
      }

      const isManyToOne =
        fieldMetadataItem.relationDefinition?.direction ===
        RelationDefinitionType.MANY_TO_ONE;
      if (isRelationField && isManyToOne) {
        const relationIdFieldName = `${fieldMetadataItem.name}Id`;
        const recordInputMatchId = recordInputEntries.find(
          ([fieldName]) => fieldName === relationIdFieldName,
        );
        // Should check both never undefined ?
        if (!isDefined(recordInputMatchId)) {
          return [];
        }
        const [fieldIdName, fieldIdValue] = recordInputMatchId;

        const relationIdFieldMetadataItem = objectMetadataItem.fields.find(
          (field) => field.name === relationIdFieldName,
        );
        if (!isDefined(relationIdFieldMetadataItem)) {
          return [];
        }

        const isRecordInputFieldIdNull = isNull(fieldIdValue); // In fact this should never occurs ?
        // Should check invariant in recordInput company is never defined and companyId is ?
        if (isRecordInputFieldIdNull) {
          return [
            [fieldIdName, null],
            [fieldMetadataItem.name, null],
          ];
        } else {
          const fromCacheStuff = { id: 'cache' };
          
          return [
            [fieldIdName, recordInput[fieldIdName]?.id ?? null],
            [fieldMetadataItem.name, fromCacheStuff],
          ];
        }
      }

      if (!isDefined(recordInputMatch)) {
        throw new Error('Should never occurs TODO TEXT');
      }
      const [fieldName, fieldValue] = recordInputMatch;

      if (!fieldMetadataItem.isNullable && fieldValue == null) {
        return [];
      }

      return [[fieldName, fieldValue]];
    },
  );
  const sanitizedResultRecord = Object.fromEntries(sanitizedEntries);
  const recordDomainNameIsDefined =
    isDefined(sanitizedResultRecord?.domainName) &&
    isString(sanitizedResultRecord.domainName);
  if (!recordDomainNameIsDefined) {
    return sanitizedResultRecord;
  }

  return {
    ...sanitizedResultRecord,
    // We should have a look to latest typeScript version that should infer typing from isDefined and IsString here
    domainName: getUrlHostName(sanitizedResultRecord.domainName as string),
  };
};
