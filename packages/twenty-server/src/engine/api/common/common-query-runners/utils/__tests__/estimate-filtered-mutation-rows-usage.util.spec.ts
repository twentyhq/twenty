import { buildRowsEstimationContextMock } from 'src/engine/api/common/common-query-runners/utils/__mocks__/build-rows-estimation-context.mock';
import { estimateFilteredMutationRowsUsage } from 'src/engine/api/common/common-query-runners/utils/estimate-filtered-mutation-rows-usage.util';

const context = buildRowsEstimationContextMock({
  objectNameSingular: 'person',
});

describe('estimateFilteredMutationRowsUsage', () => {
  it('should read and write one row for a mutation by id', () => {
    expect(
      estimateFilteredMutationRowsUsage({
        filter: { id: { eq: 'person-id' } },
        select: { id: true },
        context,
      }),
    ).toEqual({ rowsRead: 1, rowsWritten: 1 });
  });

  it('should read and write the rows listed by id', () => {
    expect(
      estimateFilteredMutationRowsUsage({
        filter: { id: { in: ['a', 'b', 'c'] } },
        select: { id: true },
        context,
      }),
    ).toEqual({ rowsRead: 3, rowsWritten: 3 });
  });

  it('should add the relations returned for the written rows', () => {
    expect(
      estimateFilteredMutationRowsUsage({
        filter: { companyId: { eq: 'company-id' } },
        select: { id: true, company: { id: true } },
        context,
      }),
    ).toEqual({ rowsRead: 30, rowsWritten: 15 });
  });

  it('should read and write the whole table for a filter without an index', () => {
    expect(
      estimateFilteredMutationRowsUsage({
        filter: { name: { firstName: { eq: 'John' } } },
        select: { id: true },
        context,
      }),
    ).toEqual({ rowsRead: 300_000, rowsWritten: 300_000 });
  });
});
