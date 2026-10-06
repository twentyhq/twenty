import { resolveNativeHostEvent } from '../resolveNativeHostEvent';

describe('resolveNativeHostEvent', () => {
  it('should resolve a React synthetic event to its native event', () => {
    const nativeEvent = { type: 'input' };

    expect(resolveNativeHostEvent({ type: 'change', nativeEvent })).toBe(
      nativeEvent,
    );
  });

  it('should resolve a native event to itself', () => {
    const hostEvent = { type: 'focusin' };

    expect(resolveNativeHostEvent(hostEvent)).toBe(hostEvent);
  });

  it('should resolve an event whose native event is not an object to itself', () => {
    const hostEvent = { type: 'click', nativeEvent: null };

    expect(resolveNativeHostEvent(hostEvent)).toBe(hostEvent);
  });
});
