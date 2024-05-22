import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useLabelIdentifierFieldPreviewValue } from '@/settings/data-model/fields/preview/hooks/useLabelIdentifierFieldPreviewValue';

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
  useLabelIdentifierFieldPreviewValue({
    objectMetadataItem: relationObjectMetadataItem,
    skip,
  });
