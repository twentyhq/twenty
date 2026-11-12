import { describe, expect, it } from 'vitest';

import { parseExportOrderBy } from '@/data/export/parse-export-order-by';

describe('parseExportOrderBy', () => {
  it('supports composite sort fields and preserves an explicit id sort', () => {
    expect(
      parseExportOrderBy('name.firstName[AscNullsLast],id[DescNullsFirst]'),
    ).toEqual([
      { name: { firstName: 'AscNullsLast' } },
      { id: 'DescNullsFirst' },
    ]);
    expect(parseExportOrderBy('employees')).toEqual([
      { employees: 'AscNullsFirst' },
      { id: 'AscNullsLast' },
    ]);
  });
  it.each(['', 'name[invalid]', 'name[AscNullsLast'])(
    'rejects invalid order %s',
    (value) =>
      expect(() => parseExportOrderBy(value)).toThrow('Invalid REST order_by'),
  );
});
