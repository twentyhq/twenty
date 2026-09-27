import { buildRecordImportMatchColumnsData } from '@/record-import/utils/buildRecordImportMatchColumnsData';
import { uniqueEntries } from '@/spreadsheet-import/utils/uniqueEntries';

describe('buildRecordImportMatchColumnsData', () => {
  it('puts example rows first and exposes every distinct value per column', () => {
    const data = buildRecordImportMatchColumnsData({
      exampleRows: [
        ['Acme', 'Lead'],
        ['Globex', 'Customer'],
      ],
      distinctValuesByColumn: [
        ['Acme', 'Globex', 'Initech'],
        ['Lead', 'Customer'],
      ],
    });

    expect(data.slice(0, 2)).toEqual([
      ['Acme', 'Lead'],
      ['Globex', 'Customer'],
    ]);
    expect(uniqueEntries(data, 1).map(({ entry }) => entry)).toEqual([
      'Lead',
      'Customer',
    ]);
    expect(uniqueEntries(data, 0)).toHaveLength(3);
  });
});
