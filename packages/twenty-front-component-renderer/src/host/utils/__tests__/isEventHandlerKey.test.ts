import { isEventHandlerKey } from '../isEventHandlerKey';

describe('isEventHandlerKey', () => {
  it('should match keys starting with on regardless of casing', () => {
    expect(isEventHandlerKey('onClick')).toBe(true);
    expect(isEventHandlerKey('onclick')).toBe(true);
    expect(isEventHandlerKey('ONMOUSEOVER')).toBe(true);
  });

  it('should not match non-event keys', () => {
    expect(isEventHandlerKey('href')).toBe(false);
    expect(isEventHandlerKey('className')).toBe(false);
    expect(isEventHandlerKey('data-testid')).toBe(false);
  });
});
