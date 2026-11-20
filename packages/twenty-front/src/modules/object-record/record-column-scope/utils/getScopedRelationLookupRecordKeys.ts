import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { isDefined } from 'twenty-shared/utils';

export const getScopedRelationLookupRecordKeys = (
  scopedRelationAliases: Pick<
    ScopedRelationAlias,
    'responseKey' | 'lookupTarget'
  >[],
): string[] =>
  scopedRelationAliases
    .filter(({ lookupTarget }) => isDefined(lookupTarget))
    .map(({ responseKey }) => responseKey);
