import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilValue } from 'recoil';

type Configuration = {
  source?: string;
  filter?: string;
  dataOnDisplayX?: string;
  sortBy?: string;
  dataOnDisplayY?: string;
  groupByY?: string;
  colors?: string;
  axisName?: string;
  dataLabels?: string;
};

export const useChartSettingsValues = (configuration: Configuration) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === configuration.source,
  );

  const getChartSettingsValues = (itemId: string) => {
    switch (itemId) {
      case 'source':
        return objectMetadataItem?.labelPlural || configuration.source;
      default:
        return '';
    }
  };

  return {
    getChartSettingsValues,
  };
};
