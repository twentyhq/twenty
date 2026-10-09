import { Autocomplete } from '@base-ui/react/autocomplete';
import { Window } from '@remote-dom/polyfill';
import { act, type Ref, useImperativeHandle } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { installTextTreeWalkerPolyfill } from '../installTextTreeWalkerPolyfill';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const LIVE_REGION_MARKER = '\u2060';
const LIVE_REGION_RESET_DELAY = 200;

const RemoteEmptyElementEffect = ({
  element,
  ref,
}: {
  element: HTMLDivElement;
  ref?: Ref<HTMLDivElement>;
}) => {
  useImperativeHandle(ref, () => element, [element]);

  return null;
};

describe('Autocomplete Empty text traversal', () => {
  let container: HTMLDivElement;
  let root: Root;
  let remoteDocument: Document;

  beforeEach(() => {
    jest.useFakeTimers();

    const polyfillWindow = new Window();

    installTextTreeWalkerPolyfill({
      globalScope: { window: polyfillWindow },
    });

    remoteDocument = polyfillWindow.document as unknown as Document;
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    jest.useRealTimers();
  });

  const renderEmpty = () => {
    const emptyElement = remoteDocument.createElement('div');
    const nestedElement = remoteDocument.createElement('strong');
    const firstText = remoteDocument.createTextNode('No matching ');
    const lastText = remoteDocument.createTextNode('items');

    nestedElement.append(lastText);
    emptyElement.append(
      firstText,
      nestedElement,
      remoteDocument.createTextNode(''),
    );

    act(() => {
      root.render(
        <Autocomplete.Root items={[]}>
          <Autocomplete.Empty
            render={<RemoteEmptyElementEffect element={emptyElement} />}
          >
            No matching items
          </Autocomplete.Empty>
        </Autocomplete.Root>,
      );
    });

    return { firstText, lastText };
  };

  it('should mark the last nonempty nested text and restore it after the announcement', () => {
    const { firstText, lastText } = renderEmpty();

    expect(firstText.nodeValue).toBe('No matching ');
    expect(lastText.nodeValue).toBe(`items${LIVE_REGION_MARKER}`);

    act(() => jest.advanceTimersByTime(LIVE_REGION_RESET_DELAY));

    expect(lastText.nodeValue).toBe('items');
  });

  it('should preserve text changed while the announcement timer is pending', () => {
    const { lastText } = renderEmpty();

    lastText.nodeValue = 'updated results';

    act(() => jest.advanceTimersByTime(LIVE_REGION_RESET_DELAY));

    expect(lastText.nodeValue).toBe('updated results');
  });

  it('should restore the marker on unmount and cancel later restoration', () => {
    const { lastText } = renderEmpty();

    expect(lastText.nodeValue).toBe(`items${LIVE_REGION_MARKER}`);

    act(() => root.render(null));

    expect(lastText.nodeValue).toBe('items');
    expect(jest.getTimerCount()).toBe(0);

    lastText.nodeValue = 'detached';

    act(() => jest.advanceTimersByTime(LIVE_REGION_RESET_DELAY));

    expect(lastText.nodeValue).toBe('detached');
  });
});
