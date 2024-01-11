import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';

describe('isNonTextWritingKey', () => {
  it('should determine non-text-writing keys', () => {
    expect(isNonTextWritingKey('Tab')).toBe(true);
    expect(isNonTextWritingKey('a')).toBe(false);
  });
});
