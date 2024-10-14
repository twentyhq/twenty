import { isNull, isUndefined } from '@sniptt/guards';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getNodeTypename } from '@/object-record/cache/utils/getNodeTypename';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { getRefName } from '@/object-record/cache/utils/getRefName';
import { RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  FieldMetadataType,
  RelationDefinitionType,
} from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';
import { pascalCase } from '~/utils/string/pascalCase';

export const getRecordNodeFromRecord = <T extends ObjectRecord>({
  objectMetadataItems,
  objectMetadataItem,
  recordGqlFields,
  record,
  computeReferences = true,
  isRootLevel = true,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'fields' | 'namePlural' | 'nameSingular'
  >;
  recordGqlFields?: Record<string, any>;
  computeReferences?: boolean;
  isRootLevel?: boolean;
  record: T | null;
}) => {
  if (isNull(record)) {
    return null;
  }

  const nodeTypeName = getNodeTypename(objectMetadataItem.nameSingular);

  if (!isRootLevel && computeReferences) {
    return {
      __ref: getRefName(objectMetadataItem.nameSingular, record.id),
    } as unknown as RecordGqlNode; // Fix typing: we want a Reference in computeReferences mode
  }

  const nestedRecord = Object.fromEntries(
    Object.entries(record)
      .map(([fieldName, value]) => {
        if (isDefined(recordGqlFields) && !recordGqlFields[fieldName]) {
          return undefined;
        }

        const field = objectMetadataItem.fields.find(
          (field) => field.name === fieldName,
        );

        if (isUndefined(field)) {
          return undefined;
        }

        if (
          field.type === FieldMetadataType.Relation &&
          field.relationDefinition?.direction ===
            RelationDefinitionType.OneToMany
        ) {
          const oneToManyObjectMetadataItem = objectMetadataItems.find(
            (item) =>
              item.namePlural ===
              field.relationDefinition?.targetObjectMetadata.namePlural,
          );

          if (!oneToManyObjectMetadataItem) {
            return undefined;
          }

          return [
            fieldName,
            getRecordConnectionFromRecords({
              objectMetadataItems,
              objectMetadataItem: oneToManyObjectMetadataItem,
              records: value as ObjectRecord[],
              recordGqlFields:
                recordGqlFields?.[fieldName] === true ||
                isUndefined(recordGqlFields?.[fieldName])
                  ? undefined
                  : recordGqlFields?.[fieldName],
              withPageInfo: false,
              isRootLevel: false,
              computeReferences,
            }),
          ];
        }

        switch (field.type) {
          case FieldMetadataType.Relation: {
            if (
              isUndefined(
                field.relationDefinition?.targetObjectMetadata.nameSingular,
              )
            ) {
              return undefined;
            }

            if (isNull(value)) {
              return [fieldName, null];
            }

            if (isUndefined(value?.id)) {
              return undefined;
            }

            const typeName = getObjectTypename(
              field.relationDefinition?.targetObjectMetadata.nameSingular,
            );

            if (computeReferences) {
              return [
                fieldName,
                {
                  __ref: `${typeName}:${value.id}`,
                },
              ];
            }

            return [
              fieldName,
              {
                __typename: typeName,
                ...value,
              },
            ];
          }
          case FieldMetadataType.Links:
          case FieldMetadataType.Address:
          case FieldMetadataType.FullName:
          case FieldMetadataType.Currency: {
            return [
              fieldName,
              {
                ...value,
                __typename: pascalCase(field.type),
              },
            ];
          }
          default: {
            return [fieldName, value];
          }
        }
      })
      .filter(isDefined),
  ) as T; // Todo fix typing once we have investigated apollo edges / nodes removal

  return { ...nestedRecord, __typename: nodeTypeName };
};
