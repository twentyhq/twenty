import {
  type BarChartConfiguration,
  BarChartGroupMode,
  type LineChartConfiguration,
} from '~/generated-metadata/graphql';
import { isChartConfigurationTwoDimensionalStacked } from '../isChartConfigurationTwoDimensionalStacked';

describe('isChartConfigurationTwoDimensionalStacked', () => {
  describe('BarChartConfiguration', () => {
    it('should return true for bar chart with secondary axis and stacked mode', () => {
      const result = isChartConfigurationTwoDimensionalStacked({
        __typename: 'BarChartConfiguration',
        secondaryAxisGroupByFieldMetadataId: 'some-field-id',
        groupMode: BarChartGroupMode.STACKED,
      } as BarChartConfiguration);

      expect(result).toBe(true);
    });

    it('should return false for bar chart with secondary axis and grouped mode', () => {
      const result = isChartConfigurationTwoDimensionalStacked({
        __typename: 'BarChartConfiguration',
        secondaryAxisGroupByFieldMetadataId: 'some-field-id',
        groupMode: BarChartGroupMode.GROUPED,
      } as BarChartConfiguration);

      expect(result).toBe(false);
    });

    it('should return false for bar chart without secondary axis', () => {
      const result = isChartConfigurationTwoDimensionalStacked({
        __typename: 'BarChartConfiguration',
        secondaryAxisGroupByFieldMetadataId: null,
        groupMode: BarChartGroupMode.STACKED,
      } as BarChartConfiguration);

      expect(result).toBe(false);
    });
  });

  describe('LineChartConfiguration', () => {
    it('should return true for line chart with secondary axis and stacked mode', () => {
      const result = isChartConfigurationTwoDimensionalStacked({
        __typename: 'LineChartConfiguration',
        secondaryAxisGroupByFieldMetadataId: 'some-field-id',
        isStacked: true,
      } as LineChartConfiguration);

      expect(result).toBe(true);
    });

    it('should return false for line chart with secondary axis and non-stacked mode', () => {
      const result = isChartConfigurationTwoDimensionalStacked({
        __typename: 'LineChartConfiguration',
        secondaryAxisGroupByFieldMetadataId: 'some-field-id',
        isStacked: false,
      } as LineChartConfiguration);

      expect(result).toBe(false);
    });

    it('should return false for line chart without secondary axis', () => {
      const result = isChartConfigurationTwoDimensionalStacked({
        __typename: 'LineChartConfiguration',
        secondaryAxisGroupByFieldMetadataId: null,
        isStacked: true,
      } as LineChartConfiguration);

      expect(result).toBe(false);
    });
  });
});
