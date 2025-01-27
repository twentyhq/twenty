import { isNull, isString } from '@sniptt/guards';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  getRecordFromCache,
  GetRecordFromCacheArgs,
} from '@/object-record/cache/utils/getRecordFromCache';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { RelationDefinitionType } from '~/generated-metadata/graphql';
import { FieldMetadataType } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { getUrlHostName } from '~/utils/url/getUrlHostName';

type ComputeOptimisticCacheRecordInputArgs = {
  // Could be renamed
  objectMetadataItem: ObjectMetadataItem;
  recordInput: Partial<ObjectRecord>;
} & Pick<GetRecordFromCacheArgs, 'cache' | 'objectMetadataItems'>;
// TODO refactor everything here my dude
export const computeOptimisticRecordFromInput = ({
  objectMetadataItem,
  recordInput,
  cache,
  objectMetadataItems,
}: ComputeOptimisticCacheRecordInputArgs) => {
  console.log({ recordInput });
  // TODO strictly type as possible
  const recordInputEntries = Object.entries(recordInput);
  const sanitizedEntries = objectMetadataItem.fields.flatMap(
    (fieldMetadataItem) => {
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
        const targetNameSingular = fieldMetadataItem.relationDefinition?.targetObjectMetadata.nameSingular;
        const relationObjectMetataDataItem = objectMetadataItems.find(({nameSingular}) => nameSingular === targetNameSingular);
        // Could relationObjectMetataDataItem in case we haven't fetch all the related objectDataItems ? should silent error on this one ?
        if (!isDefined(targetNameSingular) || !isDefined(relationObjectMetataDataItem)) {
          throw new Error("Should never occurs invalid relation TODO TEXT")
        }
        const recordGqlFields = generateDepthOneRecordGqlFields({objectMetadataItem: relationObjectMetataDataItem})
        const cachedRecord = getRecordFromCache({
          cache,
          objectMetadataItem: relationObjectMetataDataItem,
          objectMetadataItems,
          recordId: fieldIdValue,
          recordGqlFields,
        });
        console.log({fieldIdValue, cachedRecord})
        if(!isDefined(cachedRecord) || Object.keys(cachedRecord).length <= 0) {
          console.log("NOPE", {cachedRecord})
          return []
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
  console.log({sanitizedEntries})
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
