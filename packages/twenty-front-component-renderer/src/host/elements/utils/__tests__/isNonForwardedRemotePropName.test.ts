import { isNonForwardedRemotePropName } from '../isNonForwardedRemotePropName';

describe('isNonForwardedRemotePropName', () => {
  it('should not forward remote-dom internal props', () => {
    expect(isNonForwardedRemotePropName('element')).toBe(true);
    expect(isNonForwardedRemotePropName('receiver')).toBe(true);
    expect(isNonForwardedRemotePropName('components')).toBe(true);
    expect(isNonForwardedRemotePropName('ref')).toBe(true);
  });

  it('should not forward dangerouslySetInnerHTML', () => {
    expect(isNonForwardedRemotePropName('dangerouslySetInnerHTML')).toBe(true);
  });

  it('should forward regular props', () => {
    expect(isNonForwardedRemotePropName('id')).toBe(false);
    expect(isNonForwardedRemotePropName('className')).toBe(false);
  });
});
