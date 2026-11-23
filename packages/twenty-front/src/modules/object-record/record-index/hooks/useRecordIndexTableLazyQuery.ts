import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { useContext } from 'react';

export const useRecordIndexTableLazyQuery = (objectNameSingular: string) => {
  const params = useFindManyRecordIndexTableParams(objectNameSingular);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const recordGqlFields = useRelevantRecordsGqlFields({
    objectMetadataItem,
  });

  const scopedRelationAliases = useContext(ScopedRelationAliasesContext);

  const { fetchMoreRecordsLazy, queryIdentifier, findManyRecordsLazy } =
    useLazyFindManyRecords({
      ...params,
      recordGqlFields,
    });

  return {
    findManyRecordsLazy,
    fetchMoreRecordsLazy,
    // A column's scope changes loaded cells without changing the filter or sort, and its response key follows the scope
    queryIdentifier: `${queryIdentifier}${scopedRelationAliases
      .map(({ responseKey }) => responseKey)
      .toSorted()
      .join()}`,
  };
};
