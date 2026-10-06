import { Window } from '@remote-dom/polyfill';

import { isHostOriginatedEvent } from '../isHostOriginatedEvent';
import { markEventAsHostOriginated } from '../markEventAsHostOriginated';

describe('isHostOriginatedEvent', () => {
  it('should only recognize events marked as host originated', () => {
    const polyfillWindow = new Window();
    const hostEvent = new polyfillWindow.Event('click');
    const guestEvent = new polyfillWindow.Event('click');

    markEventAsHostOriginated(hostEvent);

    expect(isHostOriginatedEvent(hostEvent)).toBe(true);
    expect(isHostOriginatedEvent(guestEvent)).toBe(false);
    expect(Object.keys(hostEvent)).toEqual(Object.keys(guestEvent));
  });
});
