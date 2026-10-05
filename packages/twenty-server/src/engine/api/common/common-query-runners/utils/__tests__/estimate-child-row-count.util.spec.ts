import { buildRowsEstimationContextMock } from 'src/engine/api/common/common-query-runners/utils/__mocks__/build-rows-estimation-context.mock';
import { estimateChildRowCount } from 'src/engine/api/common/common-query-runners/utils/estimate-child-row-count.util';

describe('estimateChildRowCount', () => {
  it('should count the average children of each parent', () => {
    expect(
      estimateChildRowCount({
        parentRowCount: 2,
        context: buildRowsEstimationContextMock({
          objectNameSingular: 'company',
        }),
      }),
    ).toBe(30);
  });

  it('should count nothing for an object without one-to-many relations', () => {
    expect(
      estimateChildRowCount({
        parentRowCount: 2,
        context: buildRowsEstimationContextMock({
          objectNameSingular: 'person',
        }),
      }),
    ).toBe(0);
  });
});
