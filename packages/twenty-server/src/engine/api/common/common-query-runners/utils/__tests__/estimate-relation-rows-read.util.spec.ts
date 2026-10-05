import { buildRowsEstimationContextMock } from 'src/engine/api/common/common-query-runners/utils/__mocks__/build-rows-estimation-context.mock';
import { estimateRelationRowsRead } from 'src/engine/api/common/common-query-runners/utils/estimate-relation-rows-read.util';

const personContext = buildRowsEstimationContextMock({
  objectNameSingular: 'person',
});

const companyContext = buildRowsEstimationContextMock({
  objectNameSingular: 'company',
});

describe('estimateRelationRowsRead', () => {
  it('should read nothing when no relation is selected', () => {
    expect(
      estimateRelationRowsRead({
        select: { id: true },
        parentRowCount: 60,
        context: personContext,
      }),
    ).toBe(0);
  });

  it('should read one row per parent for a to-one relation', () => {
    expect(
      estimateRelationRowsRead({
        select: { id: true, company: { id: true } },
        parentRowCount: 60,
        context: personContext,
      }),
    ).toBe(60);
  });

  it('should read the average children per parent for a one-to-many relation', () => {
    expect(
      estimateRelationRowsRead({
        select: { id: true, people: { id: true } },
        parentRowCount: 60,
        context: companyContext,
      }),
    ).toBe(900);
  });

  it('should cap the children read per parent', () => {
    expect(
      estimateRelationRowsRead({
        select: { id: true, people: { id: true } },
        parentRowCount: 60,
        context: companyContext,
        recordLimitPerParent: 5,
      }),
    ).toBe(300);
  });

  it('should add the relations selected under a relation', () => {
    expect(
      estimateRelationRowsRead({
        select: { id: true, people: { id: true, company: { id: true } } },
        parentRowCount: 60,
        context: companyContext,
      }),
    ).toBe(1_800);
  });
});
