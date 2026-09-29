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

  it('should keep a single value that is valid JSON but not an array', () => {
    expect(spreadsheetImportParseMultiSelectOptionsOrThrow('2024')).toEqual([
      '2024',
    ]);
    expect(spreadsheetImportParseMultiSelectOptionsOrThrow('true')).toEqual([
      'true',
    ]);
    expect(spreadsheetImportParseMultiSelectOptionsOrThrow('null')).toEqual([
      'null',
    ]);
  });

  it('should split comma separated values that are valid JSON scalars', () => {
    expect(
      spreadsheetImportParseMultiSelectOptionsOrThrow('2023, 2024'),
    ).toEqual(['2023', '2024']);
  });

  it('should throw an error if the value is not parsable', () => {
    expect(() => spreadsheetImportParseMultiSelectOptionsOrThrow({})).toThrow();
  });
});
