import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsByNamePluralMapSelector } from '@/object-metadata/states/objectMetadataItemsByNamePluralMapSelector';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { MultiObjectRecordQueryResult } from '@/object-record/relation-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';
import { formatMultiObjectRecordSearchResults } from '@/object-record/relation-picker/utils/formatMultiObjectRecordSearchResults';
import { ObjectRecordForSelect } from '@/object-record/types/ObjectRecordForSelect';
import { isDefined } from '~/utils/isDefined';

export const useMultiObjectSearchQueryResultFormattedAsObjectRecordsMap = ({
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
    return formatMultiObjectRecordSearchResults(multiObjectRecordsQueryResult);
  }, [multiObjectRecordsQueryResult]);

  const objectRecordsMap = useMemo(() => {
    const recordsByNamePlural: { [key: string]: ObjectRecordForSelect[] } = {};
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
