import { buildRowsEstimationContextMock } from 'src/engine/api/common/common-query-runners/utils/__mocks__/build-rows-estimation-context.mock';
import { estimateJoinedRowCount } from 'src/engine/api/common/common-query-runners/utils/estimate-joined-row-count.util';

const context = buildRowsEstimationContextMock({
  objectNameSingular: 'person',
});

describe('estimateJoinedRowCount', () => {
  it('should count the target table of a relation referenced by name', () => {
    expect(estimateJoinedRowCount({ fieldNames: ['company'], context })).toBe(
      20_000,
    );
  });

  it('should count a relation joined twice once', () => {
    expect(
      estimateJoinedRowCount({ fieldNames: ['company', 'company'], context }),
    ).toBe(20_000);
  });

  it('should count nothing for a join column or a plain field', () => {
    expect(
      estimateJoinedRowCount({ fieldNames: ['companyId', 'name'], context }),
    ).toBe(0);
  });
});
