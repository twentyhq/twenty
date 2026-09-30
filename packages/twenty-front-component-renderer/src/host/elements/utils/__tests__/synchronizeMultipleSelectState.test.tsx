import '@/remote/generated/remote-elements';

import {
  BatchingRemoteConnection,
  type RemoteRootElement,
} from '@remote-dom/core/elements';
import { RemoteReceiver } from '@remote-dom/core/receivers';
import {
  createRemoteComponentRenderer,
  RemoteRootRenderer,
} from '@remote-dom/react/host';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { installSelectorMethodsPolyfill } from '@/polyfills/selectors/utils/installSelectorMethodsPolyfill';
import { patchRemoteElementAttributes } from '@/remote/elements/utils/patchRemoteElementAttributes';

import { createHtmlHostWrapper } from '../createHtmlHostWrapper';

type RemoteElementWithProperties = HTMLElement & Record<string, unknown>;

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createRemoteElement = (tagName: string): RemoteElementWithProperties => {
  const element = document.createElement(
    tagName,
  ) as RemoteElementWithProperties;

  installSelectorMethodsPolyfill({
    elementPrototype: element,
    querySelectorTargets: [element],
    resolveActiveElement: () => null,
    resolveFocusVisibleElement: () => null,
  });

  return element;
};

describe('multiple select state synchronization', () => {
  let container: HTMLDivElement;
  let root: Root;
  let remoteRoot: RemoteRootElement;

  beforeAll(() => {
    patchRemoteElementAttributes();
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    remoteRoot = document.createElement('remote-root');
    document.body.append(remoteRoot);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    remoteRoot.remove();
  });

  it('should retain every selected option after the host event returns through the worker', async () => {
    const user = userEvent.setup();
    const receiver = new RemoteReceiver();
    const connection = new BatchingRemoteConnection(receiver.connection, {
      batch: jest.fn(),
    });
    const select = createRemoteElement('html-select');
    const firstOption = createRemoteElement('html-option');
    const duplicateOption = createRemoteElement('html-option');
    const lastOption = createRemoteElement('html-option');

    select.multiple = true;
    firstOption.value = 'duplicate';
    firstOption.textContent = 'First';
    duplicateOption.value = 'duplicate';
    duplicateOption.textContent = 'Duplicate';
    lastOption.value = 'last';
    lastOption.textContent = 'Last';
    select.append(firstOption, duplicateOption, lastOption);
    select.addEventListener('change', jest.fn());
    remoteRoot.append(select);
    remoteRoot.connect(connection);

    act(() => {
      root.render(
        <RemoteRootRenderer
          receiver={receiver}
          components={
            new Map(
              ['select', 'option'].map((htmlTag) => [
                `html-${htmlTag}`,
                createRemoteComponentRenderer(createHtmlHostWrapper(htmlTag)),
              ]),
            )
          }
        />,
      );
      connection.flush();
    });

    const hostSelect = within(container).getByRole(
      'listbox',
    ) as HTMLSelectElement;
    const hostOptions = hostSelect.options;

    await act(async () => {
      await user.selectOptions(hostSelect, [hostOptions[1], hostOptions[2]]);
      connection.flush();
    });

    expect(Array.from(hostSelect.selectedOptions)).toEqual([
      hostOptions[1],
      hostOptions[2],
    ]);
    expect(select.value).toBe('duplicate');
    expect(Array.from(select.querySelectorAll('option:checked'))).toEqual([
      duplicateOption,
      lastOption,
    ]);

    act(() => {
      select.className = 'updated';
      connection.flush();
    });

    expect(Array.from(hostSelect.selectedOptions)).toEqual([
      hostOptions[1],
      hostOptions[2],
    ]);

    await act(async () => {
      await user.deselectOptions(hostSelect, [hostOptions[1], hostOptions[2]]);
      connection.flush();
    });

    expect(Array.from(hostSelect.selectedOptions)).toEqual([]);
    expect(select.value).toBe('');
    expect(Array.from(select.querySelectorAll('option:checked'))).toEqual([]);

    act(() => {
      select.value = ['last'];
      connection.flush();
    });

    expect(Array.from(hostSelect.selectedOptions)).toEqual([hostOptions[2]]);
  });
});
