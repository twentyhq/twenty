import { collectFilterFieldNames } from 'src/engine/api/common/common-query-runners/utils/collect-filter-field-names.util';

describe('collectFilterFieldNames', () => {
  it('should collect the field names under and, or and not', () => {
    expect(
      collectFilterFieldNames({
        name: { firstName: { eq: 'John' } },
        and: [{ companyId: { eq: 'company-id' } }],
        or: [
          { company: { id: { eq: 'company-id' } } },
          { jobTitle: { eq: 'CEO' } },
        ],
        not: { city: { eq: 'Paris' } },
      }),
    ).toEqual(['name', 'companyId', 'company', 'jobTitle', 'city']);
  });
});
