import { getChartValueDisplayType } from '@/page-layout/widgets/graph/utils/getChartValueDisplayType';
import { ChartNumberFormat } from '~/generated-metadata/graphql';

describe('getChartValueDisplayType', () => {
  it('should return number when the format is FULL', () => {
    expect(getChartValueDisplayType(ChartNumberFormat.FULL)).toBe('number');
  });

  it('should return shortNumber when the format is SHORT', () => {
    expect(getChartValueDisplayType(ChartNumberFormat.SHORT)).toBe(
      'shortNumber',
    );
  });

  it('should fall back to the default format when the format is null', () => {
    expect(getChartValueDisplayType(null)).toBe('shortNumber');
  });

  it('should fall back to the default format when the format is undefined', () => {
    expect(getChartValueDisplayType(undefined)).toBe('shortNumber');
  });
});
