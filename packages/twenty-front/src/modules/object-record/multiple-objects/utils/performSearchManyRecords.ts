import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { MorphItem } from '@/object-record/multiple-objects/types/MorphItem';
import { generateCombinedSearchRecordsQuery } from '@/object-record/multiple-objects/utils/generateCombinedSearchRecordsQuery';
import { getLimitPerMetadataItem } from '@/object-record/multiple-objects/utils/getLimitPerMetadataItem';
import { isNonEmptyArray } from '@sniptt/guards';
import { capitalize, isDefined } from 'twenty-shared';

export const performSearchManyRecords = ({
  searchFilter,
  searchableObjectMetadataItems,
  morphItems,
}: {
  searchFilter: string;
  searchableObjectMetadataItems: ObjectMetadataItem[];
  morphItems: MorphItem[];
}) => {
  const filterPerMetadataItemFilteredOnPickedRecordId = Object.fromEntries(
    searchableObjectMetadataItems
      .map(({ id, nameSingular }) => {
        const recordIdsForMetadataItem = morphItems
          .filter(({ objectMetadataId }) => objectMetadataId === id)
          .map(({ recordId }) => recordId);

        if (!isNonEmptyArray(recordIdsForMetadataItem)) {
          return null;
        }

        return [
          `filter${capitalize(nameSingular)}`,
          {
            id: {
              in: recordIdsForMetadataItem,
            },
          },
        ];
      })
      .filter(isDefined),
  );

  const searchableObjectMetadataItemsFilteredOnRecordId =
    searchableObjectMetadataItems.filter(({ nameSingular }) =>
      isDefined(
        filterPerMetadataItemFilteredOnPickedRecordId[
          `filter${capitalize(nameSingular)}`
        ],
      ),
    );

  const combinedSearchRecordsQueryFilteredOnPickedRecords =
    generateCombinedSearchRecordsQuery({
      objectMetadataItems: searchableObjectMetadataItemsFilteredOnRecordId,
      operationSignatures: searchableObjectMetadataItemsFilteredOnRecordId.map(
        (objectMetadataItem) => ({
          objectNameSingular: objectMetadataItem.nameSingular,
          variables: {},
        }),
      ),
    });

  const limitPerMetadataItem = getLimitPerMetadataItem(
    searchableObjectMetadataItemsFilteredOnRecordId,
    10,
  );

  return {
    query: combinedSearchRecordsQueryFilteredOnPickedRecords,
    variables: {
      search: searchFilter,
      ...limitPerMetadataItem,
      ...filterPerMetadataItemFilteredOnPickedRecordId,
    },
  };
};
