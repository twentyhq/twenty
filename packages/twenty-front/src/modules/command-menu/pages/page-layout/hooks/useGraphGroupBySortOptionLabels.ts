import { getFieldLabelWithSubField } from '@/command-menu/pages/page-layout/utils/getFieldLabelWithSubField';
import { getSortLabelSuffixForFieldType } from '@/command-menu/pages/page-layout/utils/getSortLabelSuffixForFieldType';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { type CompositeFieldSubFieldName } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';
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

    const groupBySortLabelSuffix = getSortLabelSuffixForFieldType({
      fieldType: field?.type,
      orderBy: graphOrderBy,
    });

    switch (graphOrderBy) {
      case GraphOrderBy.FIELD_ASC:
      case GraphOrderBy.FIELD_DESC:
      case GraphOrderBy.FIELD_POSITION_ASC:
      case GraphOrderBy.FIELD_POSITION_DESC:
        return `${fieldLabel} ${groupBySortLabelSuffix}`;
      case GraphOrderBy.VALUE_ASC:
      case GraphOrderBy.VALUE_DESC:
        return '';
      case GraphOrderBy.MANUAL:
        return t`Manual`;
      default:
        assertUnreachable(graphOrderBy);
    }
  };

  return {
    getGroupBySortOptionLabel,
  };
};
