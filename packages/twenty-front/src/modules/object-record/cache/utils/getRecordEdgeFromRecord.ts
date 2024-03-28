import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getEdgeTypename } from '@/object-record/cache/utils/getEdgeTypename';
import { getNodeTypename } from '@/object-record/cache/utils/getNodeTypename';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';
import { isDefined } from '~/utils/isDefined';

export const getRecordEdgeFromRecord = <T extends ObjectRecord>({
  objectMetadataItems,
  objectMetadataItem,
  queryFields,
  record,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'fields' | 'namePlural' | 'nameSingular'
  >;
  queryFields?: Record<string, any>;
  record: T;
}) => {
  const nestedRecord = Object.fromEntries(
    Object.entries(record)
      .map(([key, value]) => {
        if (isDefined(queryFields) && !queryFields[key]) {
          return undefined;
        }

        if (Array.isArray(value)) {
          const objectMetadataItem = objectMetadataItems.find(
            (objectMetadataItem) => objectMetadataItem.namePlural === key,
          );

          if (!objectMetadataItem) {
            return undefined;
          }

          return [
            key,
            getRecordConnectionFromRecords({
              objectMetadataItems,
              objectMetadataItem: objectMetadataItem,
              records: value as ObjectRecord[],
              queryFields: queryFields?.[key] ?? undefined,
              withPageInfo: false,
            }),
          ];
        }
        return [key, value];
      })
      .filter(isDefined),
  ) as T; // Todo fix typing once we have investigated apollo edges / nodes removal

  return {
    __typename: getEdgeTypename({
      objectNameSingular: objectMetadataItem.nameSingular,
    }),
    node: {
      __typename: getNodeTypename({
        objectNameSingular: objectMetadataItem.nameSingular,
      }),
      ...nestedRecord,
    },
    cursor: '',
  } as ObjectRecordEdge<T>;
};
