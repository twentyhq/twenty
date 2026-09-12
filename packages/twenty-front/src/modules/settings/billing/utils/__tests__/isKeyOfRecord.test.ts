import { isKeyOfRecord } from '@/settings/billing/utils/isKeyOfRecord';

const RECORD = { workspace: 1, apiKey: 2 };

describe('isKeyOfRecord', () => {
  it('accepts a key the record owns', () => {
    expect(isKeyOfRecord(RECORD, 'workspace')).toBe(true);
  });

  it('rejects a key the record does not own', () => {
    expect(isKeyOfRecord(RECORD, 'martian')).toBe(false);
  });

  it('rejects inherited properties', () => {
    expect(isKeyOfRecord(RECORD, 'constructor')).toBe(false);
    expect(isKeyOfRecord(RECORD, 'toString')).toBe(false);
    expect(isKeyOfRecord(RECORD, '__proto__')).toBe(false);
  });
});
