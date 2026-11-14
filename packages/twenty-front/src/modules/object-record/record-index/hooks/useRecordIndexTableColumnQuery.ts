import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useScopedRelationAliases } from '@/object-record/record-column-scope/hooks/useScopedRelationAliases';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';
import { useMemo } from 'react';

// Shared by the initial and offset loads so both select the same columns
export const useRecordIndexTableColumnQuery = (
  objectMetadataItem: EnrichedObjectMetadataItem,
) => {
  const recordGqlFields = useRelevantRecordsGqlFields({ objectMetadataItem });
  const relationAliases = useScopedRelationAliases();

  const columnQueryFingerprint = useMemo(
    () =>
      JSON.stringify(
        relationAliases.map(({ alias, filter, orderBy, first }) => [
          alias,
          filter,
          orderBy,
          first,
        ]),
      ),
    [relationAliases],
  );

  return { recordGqlFields, relationAliases, columnQueryFingerprint };
};
