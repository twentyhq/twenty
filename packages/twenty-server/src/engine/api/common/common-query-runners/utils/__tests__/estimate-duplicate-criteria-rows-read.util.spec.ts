import { buildRowsEstimationContextMock } from 'src/engine/api/common/common-query-runners/utils/__mocks__/build-rows-estimation-context.mock';
import { estimateDuplicateCriteriaRowsRead } from 'src/engine/api/common/common-query-runners/utils/estimate-duplicate-criteria-rows-read.util';

describe('estimateDuplicateCriteriaRowsRead', () => {
  it('should read the whole table when one criteria has no index', () => {
    expect(
      estimateDuplicateCriteriaRowsRead(
        buildRowsEstimationContextMock({ objectNameSingular: 'person' }),
      ),
    ).toBe(300_000);
  });

  it('should read one row per criteria served by a unique index', () => {
    expect(
      estimateDuplicateCriteriaRowsRead(
        buildRowsEstimationContextMock({
          objectNameSingular: 'person',
          duplicateCriteria: [['emailsPrimaryEmail']],
        }),
      ),
    ).toBe(1);
  });

  it('should read nothing without duplicate criteria', () => {
    expect(
      estimateDuplicateCriteriaRowsRead(
        buildRowsEstimationContextMock({
          objectNameSingular: 'person',
          duplicateCriteria: [],
        }),
      ),
    ).toBe(0);
  });
});
