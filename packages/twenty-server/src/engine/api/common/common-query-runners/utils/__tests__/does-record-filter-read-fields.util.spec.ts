import { doesRecordFilterReadFields } from 'src/engine/api/common/common-query-runners/utils/does-record-filter-read-fields.util';

const FORMULA_FIELD_NAMES = new Set(['total']);

describe('doesRecordFilterReadFields', () => {
  it('should find a field read at the top level', () => {
    expect(
      doesRecordFilterReadFields({
        filter: { total: { gt: 10 } },
        fieldNames: FORMULA_FIELD_NAMES,
      }),
    ).toBe(true);
  });

  it('should find a field read inside and, or and not', () => {
    expect(
      doesRecordFilterReadFields({
        filter: {
          and: [{ name: { eq: 'a' } }, { or: [{ not: { total: { gt: 1 } } }] }],
        },
        fieldNames: FORMULA_FIELD_NAMES,
      }),
    ).toBe(true);
  });

  it('should ignore filters on other fields and on relations', () => {
    expect(
      doesRecordFilterReadFields({
        filter: { id: { eq: '1' }, company: { total: { gt: 1 } } },
        fieldNames: FORMULA_FIELD_NAMES,
      }),
    ).toBe(false);
  });

  it('should find a field compared to through a field reference', () => {
    expect(
      doesRecordFilterReadFields({
        filter: { price: { gtField: 'total' } },
        fieldNames: FORMULA_FIELD_NAMES,
      }),
    ).toBe(true);
    expect(
      doesRecordFilterReadFields({
        filter: { company: { employees: { ltField: 'gadgets.total' } } },
        fieldNames: FORMULA_FIELD_NAMES,
      }),
    ).toBe(true);
  });
});
