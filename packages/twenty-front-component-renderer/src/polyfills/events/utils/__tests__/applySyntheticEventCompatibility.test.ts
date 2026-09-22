import { Window } from '@remote-dom/polyfill';

import { applySyntheticEventCompatibility } from '../applySyntheticEventCompatibility';

describe('applySyntheticEventCompatibility', () => {
  it('should expose the event itself as its native event', () => {
    const polyfillWindow = new Window();
    const event = applySyntheticEventCompatibility(
      new polyfillWindow.Event('click'),
    );

    expect(event.nativeEvent).toBe(event);
    expect('nativeEvent' in event).toBe(true);
    expect(event.persist()).toBeUndefined();
  });

  it('should report default prevention and propagation through the react-style methods', () => {
    const polyfillWindow = new Window();
    const event = applySyntheticEventCompatibility(
      new polyfillWindow.Event('click', { cancelable: true }),
    );

    expect(event.isDefaultPrevented()).toBe(false);
    expect(event.isPropagationStopped()).toBe(false);

    event.preventDefault();
    event.stopPropagation();

    expect(event.isDefaultPrevented()).toBe(true);
    expect(event.isPropagationStopped()).toBe(true);
  });
});
