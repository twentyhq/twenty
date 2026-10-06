import '@/remote/generated/remote-elements';

import { serializeRemoteNode } from '@remote-dom/core/elements';

const readSubscribedEventTypes = (element: Element): string[] =>
  Object.keys(
    (
      serializeRemoteNode(element) as {
        eventListeners?: Record<string, unknown>;
      }
    ).eventListeners ?? {},
  );

const FORM_CONTROL_TAGS = ['html-input', 'html-textarea', 'html-select'];

describe('form control change subscription', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it.each(FORM_CONTROL_TAGS)(
    'should subscribe the host to change on a connected %s without any app listener',
    (tagName) => {
      const formControl = document.createElement(tagName);

      document.body.append(formControl);

      expect(readSubscribedEventTypes(formControl)).toEqual(['change']);
    },
  );

  it.each(FORM_CONTROL_TAGS)(
    'should drop the change subscription once the %s is removed',
    (tagName) => {
      const formControl = document.createElement(tagName);

      document.body.append(formControl);
      formControl.remove();

      expect(readSubscribedEventTypes(formControl)).toEqual([]);
    },
  );

  it('should keep the change subscription after the app removes its own change listener', () => {
    const input = document.createElement('html-input') as HTMLElement;
    const appChangeListener = jest.fn();

    document.body.append(input);
    input.addEventListener('change', appChangeListener);
    input.removeEventListener('change', appChangeListener);

    expect(readSubscribedEventTypes(input)).toEqual(['change']);
  });

  it('should not subscribe the host to change on an element that is not a form control', () => {
    const container = document.createElement('html-div');

    document.body.append(container);

    expect(readSubscribedEventTypes(container)).toEqual([]);
  });
});
