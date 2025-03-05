import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsByNamePluralMapSelector } from '@/object-metadata/states/objectMetadataItemsByNamePluralMapSelector';
import { CombinedFindManyRecordsQueryResult } from '@/object-record/multiple-objects/types/CombinedFindManyRecordsQueryResult';
import { multiRecordPickerFormatSearchResults } from '@/object-record/record-picker/multiple-record-picker/utils/multiRecordPickerFormatSearchResults';
import { isDefined } from 'twenty-shared';

export const useMultipleRecordPickerQueryResultFormattedAsObjectRecordForSelectArray =
  ({
    multiObjectRecordsQueryResult,
  }: {
    multiObjectRecordsQueryResult:
      | CombinedFindManyRecordsQueryResult
      | null
      | undefined;
  }) => {
    const objectMetadataItemsByNamePluralMap = useRecoilValue(
      objectMetadataItemsByNamePluralMapSelector,
    );

    const formattedMultiObjectRecordsQueryResult = useMemo(() => {
      return multiRecordPickerFormatSearchResults(
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
        }));
      });
    }, [
      formattedMultiObjectRecordsQueryResult,
      objectMetadataItemsByNamePluralMap,
    ]);

    return {
      objectRecordForSelectArray,
    };
  };
