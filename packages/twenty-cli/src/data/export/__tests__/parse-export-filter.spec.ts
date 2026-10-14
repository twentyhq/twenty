import { describe, expect, it } from 'vitest';

import { parseExportFilter } from '@/data/export/parse-export-filter';

describe('parseExportFilter', () => {
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

  it.each(['Acme ]', 'Acme [', 'valStart]:[valEnd'])(
    'retains literal brackets in %s and subsequent predicates',
    (value) => {
      expect(
        parseExportFilter(`name[eq]:${value},employees[gte]:5000`),
      ).toEqual({
        and: [{ name: { eq: value } }, { employees: { gte: '5000' } }],
      });
    },
  );

  it('keeps numeric and boolean strings, matching the REST parser without field metadata', () => {
    expect(parseExportFilter('employees[gte]:5000,isActive[eq]:true')).toEqual({
      and: [{ employees: { gte: '5000' } }, { isActive: { eq: 'true' } }],
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
});
