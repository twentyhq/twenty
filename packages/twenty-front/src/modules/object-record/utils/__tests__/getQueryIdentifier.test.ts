import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';

describe('getQueryIdentifier', () => {
  it('should create identifier from object name and variables', () => {
    const result = getQueryIdentifier({
      objectNameSingular: 'person',
      filter: { name: { eq: 'Alice' } },
      orderBy: [{ name: 'AscNullsFirst' }],
      limit: 10,
    });

    expect(result).toContain('person');
    expect(result).toContain('Alice');
    expect(result).toContain('10');
  });

  it('should include cursor filter when present', () => {
    const result = getQueryIdentifier({
      objectNameSingular: 'company',
      filter: {},
      orderBy: [],
      limit: 20,
      cursorFilter: { cursor: 'cursor-123', cursorDirection: 'before' },
    });

    expect(result).toContain('cursor-123');
  });

  it('should include groupBy when present', () => {
    const result = getQueryIdentifier({
      objectNameSingular: 'task',
      filter: {},
      orderBy: [],
      limit: 10,
      groupBy: [{ status: 'Done' }],
    });

    expect(result).toContain('Done');
  });

  it('should produce different identifiers for different filters', () => {
    const resultA = getQueryIdentifier({
      objectNameSingular: 'person',
      filter: { name: { eq: 'Alice' } },
      orderBy: [],
      limit: 10,
    });

    const resultB = getQueryIdentifier({
      objectNameSingular: 'person',
      filter: { name: { eq: 'Bob' } },
      orderBy: [],
      limit: 10,
    });

    expect(resultA).not.toBe(resultB);
  });
});
