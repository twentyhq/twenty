import { getRecordTableHtmlId } from '../getRecordTableHtmlId';

describe('getRecordTableHtmlId', () => {
  it('returns the correct html id format', () => {
    expect(getRecordTableHtmlId('my-table')).toBe('record-table-my-table');
  });

  it('returns the correct html id format with a different id', () => {
    expect(getRecordTableHtmlId('other-table')).toBe(
      'record-table-other-table',
    );
  });
});
