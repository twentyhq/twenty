import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilValue } from 'recoil';
import { type PageLayoutWidget } from '~/generated/graphql';

export const useChartSettingsValues = (
  configuration: PageLayoutWidget['configuration'],
) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === configuration.source,
  );

  const fieldMetadataItem = objectMetadataItem?.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === configuration.groupByFieldMetadataIdX,
  );

  const getChartSettingsValues = (itemId: string) => {
    switch (itemId) {
      case 'source':
        return objectMetadataItem?.labelPlural || configuration.source;
      case 'data-on-display-x':
        return fieldMetadataItem?.label || configuration.dataOnDisplayX;
      default:
        return '';
    }
  };

  return {
    getChartSettingsValues,
  };
};
