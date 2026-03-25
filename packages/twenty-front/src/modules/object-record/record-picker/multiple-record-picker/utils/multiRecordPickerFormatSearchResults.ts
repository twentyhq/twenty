import { type CombinedFindManyRecordsQueryResult } from '@/object-record/multiple-objects/types/CombinedFindManyRecordsQueryResult';

export const multiRecordPickerFormatSearchResults = (
  searchResults: CombinedFindManyRecordsQueryResult | undefined | null,
): CombinedFindManyRecordsQueryResult => {
  if (!searchResults) {
    return {};
  }

  return Object.entries(searchResults).reduce((acc, [key, value]) => {
    let newKey = key.replace(/^search/, '');
    newKey = newKey.charAt(0).toLowerCase() + newKey.slice(1);
    acc[newKey] = value;
    return acc;
  }, {} as CombinedFindManyRecordsQueryResult);
};
