import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { usePreviewRecord } from '@/settings/data-model/fields/preview/hooks/usePreviewRecord';

type UseRelationFieldPreviewParams = {
  relationObjectMetadataItem: Pick<
    ObjectMetadataItem,
    | 'fields'
    | 'labelIdentifierFieldMetadataId'
    | 'labelSingular'
    | 'nameSingular'
  >;
  skip?: boolean;
};

export const useRelationFieldPreviewValue = ({
  relationObjectMetadataItem,
  skip,
}: UseRelationFieldPreviewParams) =>
  usePreviewRecord({
    objectMetadataItem: relationObjectMetadataItem,
    skip,
  });
