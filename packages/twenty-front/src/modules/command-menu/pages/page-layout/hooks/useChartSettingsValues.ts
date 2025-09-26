import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';

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
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: configuration?.source || '',
  });

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
