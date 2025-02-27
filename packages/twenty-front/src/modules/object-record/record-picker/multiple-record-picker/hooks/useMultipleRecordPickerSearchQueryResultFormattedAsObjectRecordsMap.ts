import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsByNamePluralMapSelector } from '@/object-metadata/states/objectMetadataItemsByNamePluralMapSelector';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { CombinedFindManyRecordsQueryResult } from '@/object-record/multiple-objects/types/CombinedFindManyRecordsQueryResult';
import { multiRecordPickerFormatSearchResults } from '@/object-record/record-picker/multiple-record-picker/utils/multiRecordPickerFormatSearchResults';
import { ObjectRecordForSelect } from '@/object-record/types/ObjectRecordForSelect';
import { isDefined } from 'twenty-shared';

export const useMultipleRecordPickerSearchQueryResultFormattedAsObjectRecordsMap =
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

    const objectRecordsMap = useMemo(() => {
      const recordsByNamePlural: { [key: string]: ObjectRecordForSelect[] } =
        {};
      Object.entries(formattedMultiObjectRecordsQueryResult ?? {}).forEach(
        ([namePlural, objectRecordConnection]) => {
          const objectMetadataItem =
            objectMetadataItemsByNamePluralMap.get(namePlural);

          if (!isDefined(objectMetadataItem)) return [];
          if (!isDefined(recordsByNamePlural[namePlural])) {
            recordsByNamePlural[namePlural] = [];
          }

          objectRecordConnection.edges.forEach(({ node }) => {
            const record = {
              objectMetadataItem,
              record: node,
              recordIdentifier: getObjectRecordIdentifier({
                objectMetadataItem,
                record: node,
              }),
            } as ObjectRecordForSelect;
            recordsByNamePlural[namePlural].push(record);
          });
        },
      );
      return recordsByNamePlural;
    }, [
      formattedMultiObjectRecordsQueryResult,
      objectMetadataItemsByNamePluralMap,
    ]);

    return {
      objectRecordsMap,
    };
  };
