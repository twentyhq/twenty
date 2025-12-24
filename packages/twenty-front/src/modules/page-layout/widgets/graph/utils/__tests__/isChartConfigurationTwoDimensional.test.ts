import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated-metadata/graphql';
import { isChartConfigurationTwoDimensional } from '@/page-layout/widgets/graph/utils/isChartConfigurationTwoDimensional';

describe('isChartConfigurationTwoDimensional', () => {
  describe('BarChartConfiguration', () => {
    it('should return true for bar chart with secondary axis', () => {
      const result = isChartConfigurationTwoDimensional({
        __typename: 'BarChartConfiguration',
        secondaryAxisGroupByFieldMetadataId: 'some-field-id',
      } as BarChartConfiguration);

      expect(result).toBe(true);
    });

    it('should return false for bar chart without secondary axis', () => {
      const result = isChartConfigurationTwoDimensional({
        __typename: 'BarChartConfiguration',
        secondaryAxisGroupByFieldMetadataId: null,
      } as BarChartConfiguration);

      expect(result).toBe(false);
    });

    it('should return false for bar chart with undefined secondary axis', () => {
      const result = isChartConfigurationTwoDimensional({
        __typename: 'BarChartConfiguration',
        secondaryAxisGroupByFieldMetadataId: undefined,
      } as BarChartConfiguration);

      expect(result).toBe(false);
    });
  });

  describe('LineChartConfiguration', () => {
    it('should return true for line chart with secondary axis', () => {
      const result = isChartConfigurationTwoDimensional({
        __typename: 'LineChartConfiguration',
        secondaryAxisGroupByFieldMetadataId: 'some-field-id',
      } as LineChartConfiguration);

      expect(result).toBe(true);
    });

    it('should return false for line chart without secondary axis', () => {
      const result = isChartConfigurationTwoDimensional({
        __typename: 'LineChartConfiguration',
        secondaryAxisGroupByFieldMetadataId: null,
      } as LineChartConfiguration);

      expect(result).toBe(false);
    });

    it('should return false for line chart with undefined secondary axis', () => {
      const result = isChartConfigurationTwoDimensional({
        __typename: 'LineChartConfiguration',
        secondaryAxisGroupByFieldMetadataId: undefined,
      } as LineChartConfiguration);

      expect(result).toBe(false);
    });
  });
});
