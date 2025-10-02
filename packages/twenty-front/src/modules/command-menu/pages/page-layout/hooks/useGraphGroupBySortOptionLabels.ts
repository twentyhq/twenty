import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilValue } from 'recoil';
import { GraphOrderBy } from '~/generated/graphql';

export const useGraphGroupBySortOptionLabels = ({
  objectMetadataId,
}: {
  objectMetadataId: string;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === objectMetadataId,
  );

  const getGroupBySortOptionLabel = ({
    graphOrderBy,
    groupByFieldMetadataId,
  }: {
    graphOrderBy: GraphOrderBy;
    groupByFieldMetadataId: string;
  }): string => {
    const field = objectMetadataItem?.fields.find(
      (fieldMetadataItem) => fieldMetadataItem.id === groupByFieldMetadataId,
    );

    const fieldLabel = field?.label || 'Field';

    switch (graphOrderBy) {
      case GraphOrderBy.FIELD_ASC:
        return `${fieldLabel} Ascending`;
      case GraphOrderBy.FIELD_DESC:
        return `${fieldLabel} Descending`;
      default:
        return '';
    }
  };

  return {
    getGroupBySortOptionLabel,
  };
};
