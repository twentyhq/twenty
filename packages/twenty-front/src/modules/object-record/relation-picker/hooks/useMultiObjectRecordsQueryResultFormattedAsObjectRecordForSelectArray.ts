import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsByNamePluralMapSelector } from '@/object-metadata/states/objectMetadataItemsByNamePluralMapSelector';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { formatMultiObjectRecordSearchResults } from '@/object-record/relation-picker/utils/formatMultiObjectRecordSearchResults';
import { ObjectRecordForSelect } from '@/object-record/types/ObjectRecordForSelect';
import { isDefined } from '~/utils/isDefined';

export type MultiObjectRecordQueryResult = {
  [namePlural: string]: RecordGqlConnection;
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

    const formattedMultiObjectRecordsQueryResult = useMemo(() => {
      return formatMultiObjectRecordSearchResults(
        multiObjectRecordsQueryResult,
      );
    }, [multiObjectRecordsQueryResult]);

    const objectRecordForSelectArray = useMemo(() => {
      return Object.entries(
        formattedMultiObjectRecordsQueryResult ?? {},
      ).flatMap(([namePlural, objectRecordConnection]) => {
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
      });
    }, [
      formattedMultiObjectRecordsQueryResult,
      objectMetadataItemsByNamePluralMap,
    ]);

    return {
      objectRecordForSelectArray,
    };
  };
