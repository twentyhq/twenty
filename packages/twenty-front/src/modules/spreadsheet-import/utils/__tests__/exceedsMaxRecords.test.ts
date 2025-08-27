import { type WorkSheet } from 'xlsx-ugnis';

import { exceedsMaxRecords } from '@/spreadsheet-import/utils/exceedsMaxRecords';

describe('exceedsMaxRecords', () => {
  const maxRecords = 5;

  it('should return true if the number of records exceeds the maximum limit', () => {
    const workSheet: WorkSheet = {
      '!ref': 'A1:A10',
    };

    const result = exceedsMaxRecords(workSheet, maxRecords);

    expect(result).toBe(true);
  });

  it('should return false if the number of records does not exceed the maximum limit', () => {
    const workSheet: WorkSheet = {
      '!ref': 'A1:A4',
    };

    const result = exceedsMaxRecords(workSheet, maxRecords);

    expect(result).toBe(false);
  });

  it('should return false if the number of records is equal to the maximum limit', () => {
    const workSheet: WorkSheet = {
      '!ref': 'A1:A5',
    };

    const result = exceedsMaxRecords(workSheet, maxRecords);

    expect(result).toBe(false);
  });

  it('should return false if the worksheet does not have a defined range', () => {
    const workSheet: WorkSheet = {};

    const result = exceedsMaxRecords(workSheet, maxRecords);

    expect(result).toBe(false);
  });
});
