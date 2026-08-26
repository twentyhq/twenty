import { render } from '@testing-library/react';

import { buildHostReactPropsFromRemoteProps } from '../buildHostReactPropsFromRemoteProps';

/**
 * The unit tests call the wrapped handler directly. These render the element
 * React actually renders and dispatch the event the browser actually
 * dispatches, because that is the part the guest cannot reach: whether the
 * default is still suppressible by the time the host sees the event.
 */
describe('preventDefaultOn, through React and the DOM', () => {
  const renderTextarea = (remoteProps: Record<string, unknown>) => {
    const hostProps = buildHostReactPropsFromRemoteProps(remoteProps, 'textarea');

    const { container } = render(
      <textarea data-testid="composer" {...hostProps} />,
    );

    const element = container.querySelector('textarea');

    if (element === null) {
      throw new Error('the textarea did not render');
    }

    return element;
  };

  const pressEnter = (element: Element, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
      ...init,
    });

    element.dispatchEvent(event);

    return event;
  };

  it('should leave the default in place when the element does not opt in', () => {
    const onKeyDown = jest.fn();
    const element = renderTextarea({ onKeyDown });

    const event = pressEnter(element);

    expect(onKeyDown).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it('should suppress the default for an opted-in key', () => {
    const onKeyDown = jest.fn();
    const element = renderTextarea({
      onKeyDown,
      preventDefaultOn: ['keydown:Enter'],
    });

    const event = pressEnter(element);

    expect(event.defaultPrevented).toBe(true);
    expect(onKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'keydown', key: 'Enter' }),
    );
  });

  // A composer sends on Enter and inserts a newline on Shift+Enter, so the
  // opt-in must not swallow the second one.
  it('should leave Shift+Enter alone when only Enter is opted in', () => {
    const element = renderTextarea({
      onKeyDown: jest.fn(),
      preventDefaultOn: ['keydown:Enter'],
    });

    const event = pressEnter(element, { shiftKey: true });

    expect(event.defaultPrevented).toBe(false);
  });

  it('should not reach the DOM as an attribute', () => {
    const element = renderTextarea({
      onKeyDown: jest.fn(),
      preventDefaultOn: ['keydown:Enter'],
    });

    expect(element.getAttribute('preventDefaultOn')).toBeNull();
    expect(element.getAttribute('preventdefaulton')).toBeNull();
  });
});
