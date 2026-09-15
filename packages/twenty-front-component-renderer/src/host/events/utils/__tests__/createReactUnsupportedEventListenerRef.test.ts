import { createReactUnsupportedEventListenerRef } from '../createReactUnsupportedEventListenerRef';

describe('createReactUnsupportedEventListenerRef', () => {
  it('should forward focusin events to the latest handler', () => {
    const initialHandler = jest.fn();
    const handlersRef = { current: { focusin: initialHandler } };
    const ref = createReactUnsupportedEventListenerRef(handlersRef);
    const node = document.createElement('div');

    ref(node);
    node.dispatchEvent(new Event('focusin'));

    expect(initialHandler).toHaveBeenCalledTimes(1);

    const replacementHandler = jest.fn();
    handlersRef.current = { focusin: replacementHandler };
    node.dispatchEvent(new Event('focusin'));

    expect(initialHandler).toHaveBeenCalledTimes(1);
    expect(replacementHandler).toHaveBeenCalledTimes(1);
  });

  it('should ignore events without a registered handler', () => {
    const ref = createReactUnsupportedEventListenerRef({ current: {} });
    const node = document.createElement('div');

    ref(node);

    expect(() => node.dispatchEvent(new Event('focusout'))).not.toThrow();
  });

  it('should stop forwarding after the node detaches', () => {
    const focusinHandler = jest.fn();
    const ref = createReactUnsupportedEventListenerRef({
      current: { focusin: focusinHandler },
    });
    const node = document.createElement('div');

    ref(node);
    ref(null);
    node.dispatchEvent(new Event('focusin'));

    expect(focusinHandler).not.toHaveBeenCalled();
  });

  it('should move listeners when the node changes', () => {
    const focusinHandler = jest.fn();
    const ref = createReactUnsupportedEventListenerRef({
      current: { focusin: focusinHandler },
    });
    const firstNode = document.createElement('div');
    const secondNode = document.createElement('div');

    ref(firstNode);
    ref(secondNode);
    firstNode.dispatchEvent(new Event('focusin'));
    secondNode.dispatchEvent(new Event('focusin'));

    expect(focusinHandler).toHaveBeenCalledTimes(1);
  });
});
