import { MultiObjectRecordQueryResult } from '@/object-record/relation-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';

export const formatMultiObjectRecordSearchResults = (
  searchResults: MultiObjectRecordQueryResult | undefined | null,
): MultiObjectRecordQueryResult => {
  if (!searchResults) {
    return {};
  }

  return Object.entries(searchResults).reduce((acc, [key, value]) => {
    let newKey = key.replace(/^search/, '');
    newKey = newKey.charAt(0).toLowerCase() + newKey.slice(1);
    acc[newKey] = value;
    return acc;
  }, {} as MultiObjectRecordQueryResult);
};
