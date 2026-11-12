import { describe, expect, it } from 'vitest';

import { parseExportOrderByOrThrow } from '@/data/export/parse-export-order-by-or-throw';

describe('parseExportOrderByOrThrow', () => {
  it('supports composite sort fields and preserves an explicit id sort', () => {
    expect(
      parseExportOrderByOrThrow(
        'name.firstName[AscNullsLast],id[DescNullsFirst]',
      ),
    ).toEqual([
      { name: { firstName: 'AscNullsLast' } },
      { id: 'DescNullsFirst' },
    ]);
    expect(parseExportOrderByOrThrow('employees')).toEqual([
      { employees: 'AscNullsFirst' },
      { id: 'AscNullsLast' },
    ]);
  });
  it.each(['', 'name[invalid]', 'name[AscNullsLast'])(
    'rejects invalid order %s',
    (value) =>
      expect(() => parseExportOrderByOrThrow(value)).toThrow(
        'Invalid REST order_by',
      ),
  );
});
