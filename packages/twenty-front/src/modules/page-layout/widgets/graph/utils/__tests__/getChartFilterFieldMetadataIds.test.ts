import { getChartFilterFieldMetadataIds } from '@/page-layout/widgets/graph/utils/getChartFilterFieldMetadataIds';
import { ViewFilterOperand } from 'twenty-shared/types';
import {
  TEST_BAR_CHART_CONFIGURATION,
  TEST_IFRAME_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

describe('getChartFilterFieldMetadataIds', () => {
  it('should return the fields used by chart record filters', () => {
    expect(
      getChartFilterFieldMetadataIds({
        ...TEST_BAR_CHART_CONFIGURATION,
        filter: {
          recordFilters: [
            {
              id: 'filter-1',
              fieldMetadataId: 'region-id',
              operand: ViewFilterOperand.IS,
              value: 'EMEA',
            },
            {
              id: 'filter-2',
              fieldMetadataId: 'stage-id',
              operand: ViewFilterOperand.IS_NOT_EMPTY,
              value: '',
            },
          ],
          recordFilterGroups: [],
        },
      }),
    ).toEqual(['region-id', 'stage-id']);
  });

  it('should return no field when the chart has no filter', () => {
    expect(
      getChartFilterFieldMetadataIds(TEST_BAR_CHART_CONFIGURATION),
    ).toEqual([]);
  });

  it('should return no field for configurations that are not charts', () => {
    expect(getChartFilterFieldMetadataIds(TEST_IFRAME_CONFIGURATION)).toEqual(
      [],
    );
  });
});
