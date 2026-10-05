import { OrderByDirection } from 'twenty-shared/types';

import {
  buildRowsEstimationContextMock,
  personIdField,
  personPositionField,
} from 'src/engine/api/common/common-query-runners/utils/__mocks__/build-rows-estimation-context.mock';
import { estimateRowsRead } from 'src/engine/api/common/common-query-runners/utils/estimate-rows-read.util';
import { type OrderByLeaf } from 'src/engine/api/utils/resolve-order-by-leaves.utils';

const context = buildRowsEstimationContextMock({
  objectNameSingular: 'person',
});

const idLeaf: OrderByLeaf = {
  kind: 'scalar',
  path: ['id'],
  direction: OrderByDirection.AscNullsLast,
  fieldMetadata: personIdField,
};

const positionLeaf: OrderByLeaf = {
  kind: 'scalar',
  path: ['position'],
  direction: OrderByDirection.AscNullsFirst,
  fieldMetadata: personPositionField,
};

describe('estimateRowsRead', () => {
  it('should read one row for an equality on a unique index', () => {
    expect(
      estimateRowsRead({
        filter: { emails: { primaryEmail: { eq: 'p4242@example.com' } } },
        orderByLeaves: [idLeaf],
        limit: 61,
        context,
      }),
    ).toBe(1);
  });

  it('should read the children of one parent for an equality on a join column', () => {
    expect(
      estimateRowsRead({
        filter: { companyId: { eq: 'company-id' } },
        orderByLeaves: [positionLeaf, idLeaf],
        limit: 61,
        context,
      }),
    ).toBe(15);
  });

  it('should stop at the limit when an index serves the sort', () => {
    expect(
      estimateRowsRead({
        filter: {},
        orderByLeaves: [idLeaf],
        limit: 61,
        context,
      }),
    ).toBe(61);
  });

  it('should read the whole table for a contains filter', () => {
    expect(
      estimateRowsRead({
        filter: { name: { firstName: { ilike: '%jo%' } } },
        orderByLeaves: [positionLeaf, idLeaf],
        limit: 61,
        context,
      }),
    ).toBe(300_000);
  });

  it('should read the whole table when no index serves the sort', () => {
    expect(
      estimateRowsRead({
        filter: {},
        orderByLeaves: [positionLeaf, idLeaf],
        limit: 61,
        context,
      }),
    ).toBe(300_000);
  });

  it('should read every matching row without a limit', () => {
    expect(estimateRowsRead({ filter: {}, context })).toBe(300_000);
  });

  it('should add up OR branches that each use an index', () => {
    expect(
      estimateRowsRead({
        filter: {
          or: [
            { emails: { primaryEmail: { eq: 'p4242@example.com' } } },
            { companyId: { eq: 'company-id' } },
          ],
        },
        orderByLeaves: [idLeaf],
        limit: 61,
        context,
      }),
    ).toBe(16);
  });
});
