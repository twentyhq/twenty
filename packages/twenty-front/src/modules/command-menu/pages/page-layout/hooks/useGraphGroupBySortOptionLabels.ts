import { getFieldLabelWithSubField } from '@/command-menu/pages/page-layout/utils/getFieldLabelWithSubField';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { type CompositeFieldSubFieldName } from 'twenty-shared/types';
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
    groupBySubFieldName,
  }: {
    graphOrderBy: GraphOrderBy;
    groupByFieldMetadataId: string;
    groupBySubFieldName?: CompositeFieldSubFieldName;
  }): string => {
    const field = objectMetadataItem?.fields.find(
      (fieldMetadataItem) => fieldMetadataItem.id === groupByFieldMetadataId,
    );

    const fieldLabel = getFieldLabelWithSubField({
      field,
      subFieldName: groupBySubFieldName,
      objectMetadataItems,
    });

    switch (graphOrderBy) {
      case GraphOrderBy.FIELD_ASC:
        return `${fieldLabel} ${t`Ascending`}`;
      case GraphOrderBy.FIELD_DESC:
        return `${fieldLabel} ${t`Descending`}`;
      case GraphOrderBy.MANUAL:
        return t`Manual`;
      default:
        return '';
    }
  };

  return {
    getGroupBySortOptionLabel,
  };
};
