import { isNull, isString } from '@sniptt/guards';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  getRecordFromCache,
  GetRecordFromCacheArgs,
} from '@/object-record/cache/utils/getRecordFromCache';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { RelationDefinitionType } from '~/generated-metadata/graphql';
import { FieldMetadataType } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { getUrlHostName } from '~/utils/url/getUrlHostName';

// TODO refactor using for loop ?
// We're strict checking that any key within recordInput exists in the objectMetadaItem
type ComputeOptimisticCacheRecordInputArgs = {
  // Could be renamed
  objectMetadataItem: ObjectMetadataItem;
  recordInput: Partial<ObjectRecord>;
} & Pick<GetRecordFromCacheArgs, 'cache' | 'objectMetadataItems'>;
// TODO fix the BelongsTo relation update that inject both the ID and the instance
export const computeOptimisticRecordFromInput = ({
  objectMetadataItem,
  recordInput,
  cache,
  objectMetadataItems,
}: ComputeOptimisticCacheRecordInputArgs) => {
  console.log('computeOptimisticRecordFromInput', { recordInput });
  // TODO strictly type as possible
  const recordInputEntries = Object.entries(recordInput);
  const sanitizedEntries = objectMetadataItem.fields.flatMap(
    (fieldMetadataItem) => {
      // if uuid check for within relation to see if the fieldName is within the relation
      const isUuidField = fieldMetadataItem.type === FieldMetadataType.UUID;
      if (isUuidField) {
        const isRelationFieldId = objectMetadataItem.fields.some(
          ({ type, relationDefinition }) => {
            if (type !== FieldMetadataType.RELATION) {
              return;
            }

            if (!isDefined(relationDefinition)) {
              throw new Error('Should never occurs ? TODO TEXT');
            }

            const sourceFieldName = relationDefinition.sourceFieldMetadata.name;
            // TODO we should create utils to centralized this logic
            return `${sourceFieldName}Id` === fieldMetadataItem.name;
          },
        );

        if(isRelationFieldId) {
          return []
        }
      }

      const isRelationField =
        fieldMetadataItem.type === FieldMetadataType.RELATION;
      const recordInputMatch = recordInputEntries.find(
        ([fieldName]) => fieldName === fieldMetadataItem.name,
      );
      if (isDefined(recordInputMatch) && isRelationField) {
        throw new Error(
          'Should never provide relation mutation through anything else than the fieldId e.g companyId',
        );
      }

      if (
        isRelationField &&
        fieldMetadataItem.relationDefinition?.direction ===
          RelationDefinitionType.ONE_TO_MANY
      ) {
        return [];
      }

      const isManyToOneRelation =
        fieldMetadataItem.relationDefinition?.direction ===
        RelationDefinitionType.MANY_TO_ONE;
      if (isRelationField && isManyToOneRelation) {
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
        }
        // Is it the best way to retrieve the related objectMetadaItem it's log(n)
        const targetNameSingular =
          fieldMetadataItem.relationDefinition?.targetObjectMetadata
            .nameSingular;
        const relationObjectMetataDataItem = objectMetadataItems.find(
          ({ nameSingular }) => nameSingular === targetNameSingular,
        );
        // Could relationObjectMetataDataItem in case we haven't fetch all the related objectDataItems ? should silent error on this one ?
        if (
          !isDefined(targetNameSingular) ||
          !isDefined(relationObjectMetataDataItem)
        ) {
          throw new Error('Should never occurs invalid relation TODO TEXT');
        }
        const cachedRecord = getRecordFromCache({
          cache,
          objectMetadataItem: relationObjectMetataDataItem,
          objectMetadataItems,
          recordId: fieldIdValue,
        });
        if (!isDefined(cachedRecord) || Object.keys(cachedRecord).length <= 0) {
          return [];
        }

        return [
          [fieldIdName, fieldIdValue],
          [fieldMetadataItem.name, cachedRecord],
        ];
        // We kinda have a race condition here
        // Should we sort and filter by relation desc ? and use reduce ? => OOF
        // Here same id but will it stay the case in the future ?
        // Should be integ tested
        /*
          [
            [
                "companyId",
                "20202020-f86b-419f-b794-02319abe8637"
            ],
            [
                "companyId",
                "20202020-f86b-419f-b794-02319abe8637"
            ],
            [
                "company",
                {}
            ]
          ]
        */
      }

      if (!isDefined(recordInputMatch)) {
        return [];
      }
      const [fieldName, fieldValue] = recordInputMatch;

      if (!fieldMetadataItem.isNullable && fieldValue == null) {
        return [];
      }

      return [[fieldName, fieldValue]];
    },
  );
  console.log({ sanitizedEntries });
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
