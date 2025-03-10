import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { MorphItem } from '@/object-record/multiple-objects/types/MorphItem';
import { performSearchManyRecords } from '@/object-record/multiple-objects/utils/performSearchManyRecords';
import { multipleRecordPickerformatQueryResultAsRecordsWithObjectMetadataId } from '@/object-record/record-picker/multiple-record-picker/utils/multipleRecordPickerformatQueryResultAsRecordWithObjectMetadataId';
import { useQuery } from '@apollo/client';

export const useSearchManyRecords = ({
  searchFilter,
  searchableObjectMetadataItems,
  morphItems,
}: {
  searchFilter: string;
  searchableObjectMetadataItems: ObjectMetadataItem[];
  morphItems: MorphItem[];
}) => {
  const { query, variables } = performSearchManyRecords({
    searchFilter,
    searchableObjectMetadataItems,
    morphItems,
  });

  const { data, loading, error } = useQuery(query, {
    variables,
  });

  const { recordsWithObjectMetadataId } =
    multipleRecordPickerformatQueryResultAsRecordsWithObjectMetadataId({
      objectMetadataItems: searchableObjectMetadataItems,
      searchQueryResult: data,
    });

  return {
    recordsWithObjectMetadataId,
    loading,
    error,
  };
};
