import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { getPlaceholderRecord } from '@/settings/data-model/fields/preview/utils/getPlaceholderRecord';

type UseLabelIdentifierFieldPreviewParams = {
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    | 'fields'
    | 'labelIdentifierFieldMetadataId'
    | 'labelSingular'
    | 'nameSingular'
  >;
  skip?: boolean;
};

export const useLabelIdentifierFieldPreviewValue = ({
  objectMetadataItem,
  skip,
}: UseLabelIdentifierFieldPreviewParams) => {
  const { records } = useFindManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    limit: 1,
    skip,
  });

  if (!skip) return null;

  const [firstRecord] = records;

  const fieldPreviewValue =
    firstRecord ??
    // If no record was found, display a placeholder record
    getPlaceholderRecord({ objectMetadataItem });

  return fieldPreviewValue;
};
