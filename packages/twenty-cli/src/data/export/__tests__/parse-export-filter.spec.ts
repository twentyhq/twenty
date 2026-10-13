import { describe, expect, it } from 'vitest';

import { parseExportFilter } from '@/data/export/parse-export-filter';
import { parseExportOrderBy } from '@/data/export/parse-export-order-by';

describe('export REST input conversion', () => {
  it('supports nested conjunctions, composite fields, quoted commas, arrays and null operators', () => {
    expect(
      parseExportFilter(
        'and(name[eq]:"Acme, Inc.",or(employees[gte]:5,domainName.primaryLinkUrl[in]:["acme.test","twenty.com"]),not(deletedAt[is]:NULL))',
      ),
    ).toEqual({
      and: [
        { name: { eq: 'Acme, Inc.' } },
        {
          or: [
            { employees: { gte: '5' } },
            {
              domainName: {
                primaryLinkUrl: { in: ['acme.test', 'twenty.com'] },
              },
            },
          ],
        },
        { not: { deletedAt: { is: 'NULL' } } },
      ],
    });
  });
  it('retains apostrophes inside unquoted string values', () => {
    expect(parseExportFilter("name[eq]:O'Reilly")).toEqual({
      and: [{ name: { eq: "O'Reilly" } }],
    });
  });

  it('wraps comma-separated conditions in an implicit conjunction', () => {
    expect(parseExportFilter('tier[eq]:GOLD,employees[gt]:50')).toEqual({
      and: [{ tier: { eq: 'GOLD' } }, { employees: { gt: '50' } }],
    });
  });
  it.each([
    '',
    'name[unknown]:a',
    'and(name[eq]:a',
    'not(name[eq]:a,name[eq]:b)',
    'name[in]:a',
    'name[eq]:"unterminated',
  ])('rejects invalid filter %s', (value) => {
    expect(() => parseExportFilter(value)).toThrow('Invalid REST filter');
  });
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
