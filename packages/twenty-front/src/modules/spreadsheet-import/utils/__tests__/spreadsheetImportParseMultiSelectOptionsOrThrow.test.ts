import { spreadsheetImportParseMultiSelectOptionsOrThrow } from '@/spreadsheet-import/utils/spreadsheetImportParseMultiSelectOptionsOrThrow';

describe('spreadsheetImportParseMultiSelectOptionsOrThrow', () => {
  it('should parse multi select options', () => {
    const options = spreadsheetImportParseMultiSelectOptionsOrThrow(
      '["option1", "option2"]',
    );
    expect(options).toEqual(['option1', 'option2']);
  });

  it('should parse multi select options with comma', () => {
    const options =
      spreadsheetImportParseMultiSelectOptionsOrThrow('option1,option2');
    expect(options).toEqual(['option1', 'option2']);
  });

  it('should throw an error if the value is not parsable', () => {
    expect(() => spreadsheetImportParseMultiSelectOptionsOrThrow({})).toThrow();
  });
});
