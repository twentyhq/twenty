import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsByNamePluralMapSelector } from '@/object-metadata/states/objectMetadataItemsByNamePluralMapSelector';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { ObjectRecordForSelect } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { isDefined } from '~/utils/isDefined';

export type MultiObjectRecordQueryResult = {
  [namePlural: string]: ObjectRecordConnection;
};

export const useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray =
  ({
    multiObjectRecordsQueryResult,
  }: {
    multiObjectRecordsQueryResult:
      | MultiObjectRecordQueryResult
      | null
      | undefined;
  }) => {
    const objectMetadataItemsByNamePluralMap = useRecoilValue(
      objectMetadataItemsByNamePluralMapSelector,
    );

    const objectRecordForSelectArray = useMemo(() => {
      return Object.entries(multiObjectRecordsQueryResult ?? {}).flatMap(
        ([namePlural, objectRecordConnection]) => {
          const objectMetadataItem =
            objectMetadataItemsByNamePluralMap.get(namePlural);

          if (!isDefined(objectMetadataItem)) return [];

          return objectRecordConnection.edges.map(({ node }) => ({
            objectMetadataItem,
            record: node,
            recordIdentifier: getObjectRecordIdentifier({
              objectMetadataItem,
              record: node,
            }),
          })) as ObjectRecordForSelect[];
        },
      );
    }, [multiObjectRecordsQueryResult, objectMetadataItemsByNamePluralMap]);

    return {
      objectRecordForSelectArray,
    };
  };
