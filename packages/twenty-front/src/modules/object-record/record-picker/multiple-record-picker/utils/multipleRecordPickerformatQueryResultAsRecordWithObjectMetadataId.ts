import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type CombinedFindManyRecordsQueryResult } from '@/object-record/multiple-objects/types/CombinedFindManyRecordsQueryResult';
import { multiRecordPickerFormatSearchResults } from '@/object-record/record-picker/multiple-record-picker/utils/multiRecordPickerFormatSearchResults';
import { isDefined } from 'twenty-shared/utils';

export const multipleRecordPickerformatQueryResultAsRecordsWithObjectMetadataId =
  ({
    objectMetadataItems,
    searchQueryResult,
  }: {
    objectMetadataItems: ObjectMetadataItem[];
    searchQueryResult: CombinedFindManyRecordsQueryResult;
  }) => {
    const formattedSearchQueryResult =
      multiRecordPickerFormatSearchResults(searchQueryResult);

    const recordsWithObjectMetadataId = Object.entries(
      formattedSearchQueryResult,
    ).flatMap(([namePlural, objectRecordConnection]) => {
      const objectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) => objectMetadataItem.namePlural === namePlural,
      );

      if (!isDefined(objectMetadataItem)) return [];

      return objectRecordConnection.edges.map(({ node }) => ({
        objectMetadataItem,
        record: node,
      }));
    });

    return {
      recordsWithObjectMetadataId,
    };
  };
