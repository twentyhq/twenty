import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getChartConfigurationFieldMetadataIds } from '@/page-layout/widgets/graph/utils/getChartConfigurationFieldMetadataIds';

export type UnavailableChartField = {
  fieldMetadataId: string;
  fieldMetadataItem?: FieldMetadataItem;
};

export const getUnavailableChartFields = ({
  configuration,
  fieldMetadataItems,
}: {
  configuration: PageLayoutWidget['configuration'];
  fieldMetadataItems: FieldMetadataItem[];
}): UnavailableChartField[] => {
  const fieldMetadataItemsById = new Map(
    fieldMetadataItems.map((fieldMetadataItem) => [
      fieldMetadataItem.id,
      fieldMetadataItem,
    ]),
  );

  return [...new Set(getChartConfigurationFieldMetadataIds(configuration))]
    .map((fieldMetadataId) => ({
      fieldMetadataId,
      fieldMetadataItem: fieldMetadataItemsById.get(fieldMetadataId),
    }))
    .filter(({ fieldMetadataItem }) => fieldMetadataItem?.isActive !== true);
};
