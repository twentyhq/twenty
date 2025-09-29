import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilValue } from 'recoil';
import { capitalize } from 'twenty-shared/utils';
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
      case 'colors':
        return capitalize(configuration.color);
      default:
        return '';
    }
  };

  return {
    getChartSettingsValues,
  };
};
