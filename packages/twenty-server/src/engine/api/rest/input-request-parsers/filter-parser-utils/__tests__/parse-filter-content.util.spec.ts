import { parseFilterContent } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-filter-content.util';

describe('parseFilterContent', () => {
  it('should parse query filter test 1', () => {
    expect(parseFilterContent('and(fieldNumber[eq]:1)')).toEqual([
      'fieldNumber[eq]:1',
    ]);
  });

  it('should parse query filter test 2', () => {
    expect(
      parseFilterContent('and(fieldNumber[eq]:1,fieldNumber[eq]:2)'),
    ).toEqual(['fieldNumber[eq]:1', 'fieldNumber[eq]:2']);
  });

  it('should parse query filter test 3', () => {
    expect(
      parseFilterContent(
        'and(fieldNumber[eq]:1,or(fieldNumber[eq]:2,fieldNumber[eq]:3))',
      ),
    ).toEqual(['fieldNumber[eq]:1', 'or(fieldNumber[eq]:2,fieldNumber[eq]:3)']);
  });

  it('should parse query filter test 4', () => {
    expect(
      parseFilterContent(
        'and(fieldNumber[eq]:1,or(fieldNumber[eq]:2,not(fieldNumber[eq]:3)),fieldNumber[eq]:4,not(fieldNumber[eq]:5))',
      ),
    ).toEqual([
      'fieldNumber[eq]:1',
      'or(fieldNumber[eq]:2,not(fieldNumber[eq]:3))',
      'fieldNumber[eq]:4',
      'not(fieldNumber[eq]:5)',
    ]);
  });

  it('should parse query filter test 5', () => {
    expect(
      parseFilterContent('and(fieldNumber[in]:[1,2],fieldNumber[eq]:4)'),
    ).toEqual(['fieldNumber[in]:[1,2]', 'fieldNumber[eq]:4']);
  });

  it('should parse query filter with comma in value ', () => {
    expect(parseFilterContent('and(fieldText[eq]:"val,ue")')).toEqual([
      'fieldText[eq]:"val,ue"',
    ]);
  });

  it('should parse query filter with comma in value ', () => {
    expect(parseFilterContent("and(fieldText[eq]:'val,ue')")).toEqual([
      "fieldText[eq]:'val,ue'",
    ]);
  });
});
