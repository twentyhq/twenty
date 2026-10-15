import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';

type ChartFieldMetadataItem = Pick<
  FieldMetadataItem,
  'id' | 'isActive' | 'label'
>;

export type UnavailableChartField = {
  fieldMetadataId: string;
  fieldMetadataItem?: ChartFieldMetadataItem;
};

export const getUnavailableChartFields = ({
  fieldMetadataIds,
  fieldMetadataItems,
}: {
  fieldMetadataIds: string[];
  fieldMetadataItems: ChartFieldMetadataItem[];
}): UnavailableChartField[] => {
  const fieldMetadataItemsById = new Map(
    fieldMetadataItems.map((fieldMetadataItem) => [
      fieldMetadataItem.id,
      fieldMetadataItem,
    ]),
  );

  return [...new Set(fieldMetadataIds)]
    .map((fieldMetadataId) => ({
      fieldMetadataId,
      fieldMetadataItem: fieldMetadataItemsById.get(fieldMetadataId),
    }))
    .filter(
      ({ fieldMetadataItem }) =>
        !isDefined(fieldMetadataItem) || !fieldMetadataItem.isActive,
    );
};
