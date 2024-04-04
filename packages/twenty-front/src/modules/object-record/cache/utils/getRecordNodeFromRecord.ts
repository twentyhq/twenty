import { isNull, isUndefined } from '@sniptt/guards';

import { CachedObjectRecord } from '@/apollo/types/CachedObjectRecord';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getNodeTypename } from '@/object-record/cache/utils/getNodeTypename';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';
import { lowerAndCapitalize } from '~/utils/string/lowerAndCapitalize';

export const getRecordNodeFromRecord = <T extends ObjectRecord>({
  objectMetadataItems,
  objectMetadataItem,
  queryFields,
  record,
  computeReferences = true,
  isRootLevel = true,
  depth = 1,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'fields' | 'namePlural' | 'nameSingular'
  >;
  queryFields?: Record<string, any>;
  computeReferences?: boolean;
  isRootLevel?: boolean;
  record: T | null;
  depth?: number;
}) => {
  if (isNull(record)) {
    return null;
  }

  const nodeTypeName = getNodeTypename(objectMetadataItem.nameSingular);

  if (!isRootLevel && computeReferences) {
    return {
      __ref: `${nodeTypeName}:${record.id}`,
    } as unknown as CachedObjectRecord<T>; // Todo Fix typing
  }

  const nestedRecord = Object.fromEntries(
    Object.entries(record)
      .map(([fieldName, value]) => {
        if (isDefined(queryFields) && !queryFields[fieldName]) {
          return undefined;
        }

        const field = objectMetadataItem.fields.find(
          (field) => field.name === fieldName,
        );

        if (isUndefined(field)) {
          return undefined;
        }

        if (
          !isUndefined(depth) &&
          depth < 1 &&
          field.type === FieldMetadataType.Relation
        ) {
          return undefined;
        }

        if (Array.isArray(value)) {
          const objectMetadataItem = objectMetadataItems.find(
            (objectMetadataItem) => objectMetadataItem.namePlural === fieldName,
          );

          if (!objectMetadataItem) {
            return undefined;
          }

          return [
            fieldName,
            getRecordConnectionFromRecords({
              objectMetadataItems,
              objectMetadataItem: objectMetadataItem,
              records: value as ObjectRecord[],
              queryFields:
                queryFields?.[fieldName] === true ||
                isUndefined(queryFields?.[fieldName])
                  ? undefined
                  : queryFields?.[fieldName],
              withPageInfo: false,
              isRootLevel: false,
              computeReferences,
              depth: depth - 1,
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
          case FieldMetadataType.Link:
          case FieldMetadataType.Address:
          case FieldMetadataType.FullName:
          case FieldMetadataType.Currency: {
            return [
              fieldName,
              {
                ...value,
                __typename: lowerAndCapitalize(field.type),
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

  return {
    __typename: getNodeTypename(objectMetadataItem.nameSingular),
    ...nestedRecord,
  };
};
