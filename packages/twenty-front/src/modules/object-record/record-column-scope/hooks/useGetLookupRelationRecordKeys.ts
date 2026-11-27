import { useGetLookupRelationFieldNames } from '@/object-record/record-column-lookup/hooks/useGetLookupRelationFieldNames';
import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useGetLookupRelationRecordKeys = (recordTableId?: string) => {
  const getLookupRelationFieldNames =
    useGetLookupRelationFieldNames(recordTableId);
  const scopedRelationAliases = useContext(ScopedRelationAliasesContext);

  return useCallback(
    () => [
      ...getLookupRelationFieldNames(),
      ...scopedRelationAliases
        .filter(({ lookupTarget }) => isDefined(lookupTarget))
        .map(({ responseKey }) => responseKey),
    ],
    [getLookupRelationFieldNames, scopedRelationAliases],
  );
};
