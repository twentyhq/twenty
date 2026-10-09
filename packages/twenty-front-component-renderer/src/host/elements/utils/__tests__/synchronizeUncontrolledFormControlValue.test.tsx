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
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { FrontComponentGeometryTrackerContext } from '@/host/geometry/contexts/FrontComponentGeometryTrackerContext';
import { createGeometryTracker } from '@/host/geometry/utils/createGeometryTracker';
import { installHostEventRetargetingPolyfill } from '@/polyfills/events/utils/installHostEventRetargetingPolyfill';

import { createHtmlHostWrapper } from '../createHtmlHostWrapper';

type WorkerFormControl = HTMLElement & { value: unknown };

type WorkerCheckbox = WorkerFormControl & { type: string; checked: boolean };

type WorkerFileInput = WorkerFormControl & {
  type: string;
  files?: { name: string }[];
};

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

installHostEventRetargetingPolyfill(HTMLElement.prototype);

const HOST_COMPONENTS = new Map(
  ['form', 'input', 'textarea', 'button'].map((htmlTag) => [
    `html-${htmlTag}`,
    createRemoteComponentRenderer(createHtmlHostWrapper(htmlTag)),
  ]),
);

const createWorkerElement = (tagName: string): WorkerFormControl =>
  document.createElement(tagName) as WorkerFormControl;

const readValueOnEnter =
  (valuesReadOnEnter: unknown[]) =>
  (event: Event): void => {
    if ((event as KeyboardEvent).key !== 'Enter') {
      return;
    }

    valuesReadOnEnter.push((event.target as WorkerFormControl).value);
  };

describe('uncontrolled form control value synchronization', () => {
  let container: HTMLDivElement;
  let root: Root;
  let remoteRoot: RemoteRootElement;
  let connection: BatchingRemoteConnection;
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    remoteRoot = document.createElement('remote-root') as RemoteRootElement;
    document.body.append(remoteRoot);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    remoteRoot.remove();
  });

  const mountWorkerElements = (...workerElements: Element[]) => {
    const receiver = new RemoteReceiver();

    connection = new BatchingRemoteConnection(receiver.connection, {
      batch: jest.fn(),
    });
    remoteRoot.append(...workerElements);
    remoteRoot.connect(connection);

    act(() => {
      root.render(
        <FrontComponentGeometryTrackerContext.Provider
          value={createGeometryTracker()}
        >
          <RemoteRootRenderer
            receiver={receiver}
            components={HOST_COMPONENTS}
          />
        </FrontComponentGeometryTrackerContext.Provider>,
      );
      connection.flush();
    });
  };

  const pressKeysWithEchoAfterEach = async (
    hostElement: HTMLElement,
    keys: string[],
  ) => {
    await act(async () => {
      hostElement.focus();
    });

    for (const key of keys) {
      await act(async () => {
        await user.keyboard(key);
        connection.flush();
      });
    }
  };

  it.each([
    { tagName: 'html-input', hostValueAfterEnter: 'hi' },
    { tagName: 'html-textarea', hostValueAfterEnter: 'hi\n' },
  ])(
    'should let a keydown-only $tagName read the typed value on Enter',
    async ({ tagName, hostValueAfterEnter }) => {
      const workerControl = createWorkerElement(tagName);
      const valuesReadOnEnter: unknown[] = [];

      workerControl.addEventListener(
        'keydown',
        readValueOnEnter(valuesReadOnEnter),
      );
      mountWorkerElements(workerControl);

      const hostControl = container.querySelector(
        'input, textarea',
      ) as HTMLInputElement;

      await pressKeysWithEchoAfterEach(hostControl, ['h', 'i', '{Enter}']);

      expect(valuesReadOnEnter).toEqual(['hi']);
      expect(hostControl.value).toBe(hostValueAfterEnter);
      expect(workerControl.value).toBe(hostValueAfterEnter);
    },
  );

  it('should clear the host input every time a keydown handler empties it on Enter', async () => {
    const workerInput = createWorkerElement('html-input');
    const valuesReadOnEnter: unknown[] = [];

    workerInput.addEventListener('keydown', (event) => {
      readValueOnEnter(valuesReadOnEnter)(event);

      if ((event as KeyboardEvent).key === 'Enter') {
        workerInput.value = '';
      }
    });
    mountWorkerElements(workerInput);

    const hostInput = container.querySelector('input') as HTMLInputElement;

    await pressKeysWithEchoAfterEach(hostInput, ['h', 'i', '{Enter}']);
    expect(hostInput.value).toBe('');

    await pressKeysWithEchoAfterEach(hostInput, ['a', 'b', '{Enter}']);
    expect(hostInput.value).toBe('');

    expect(valuesReadOnEnter).toEqual(['hi', 'ab']);
  });

  it('should let a button read the typed text of a listener-less input through a ref', async () => {
    const workerInput = createWorkerElement('html-input');
    const workerButton = createWorkerElement('html-button');
    const valuesReadOnSave: unknown[] = [];

    workerButton.textContent = 'Save';
    workerButton.addEventListener('click', () => {
      valuesReadOnSave.push(workerInput.value);
    });
    mountWorkerElements(workerInput, workerButton);

    const hostInput = container.querySelector('input') as HTMLInputElement;

    await pressKeysWithEchoAfterEach(hostInput, ['t', 'y', 'p', 'e', 'd']);
    await act(async () => {
      await user.click(container.querySelector('button') as HTMLElement);
    });

    expect(valuesReadOnSave).toEqual(['typed']);
    expect(hostInput.value).toBe('typed');
  });

  it('should let a form keydown listener read the value of the input it wraps', async () => {
    const workerForm = createWorkerElement('html-form');
    const workerInput = createWorkerElement('html-input');
    const valuesReadOnEnter: unknown[] = [];

    workerForm.append(workerInput);
    workerForm.addEventListener('keydown', readValueOnEnter(valuesReadOnEnter));
    mountWorkerElements(workerForm);

    const hostInput = container.querySelector('input') as HTMLInputElement;

    await pressKeysWithEchoAfterEach(hostInput, ['h', 'i', '{Enter}']);

    expect(valuesReadOnEnter).toEqual(['hi']);
  });

  it('should keep a checkbox checked when the app only listens to input', async () => {
    const workerCheckbox = createWorkerElement('html-input') as WorkerCheckbox;
    const checkedStatesReadOnInput: boolean[] = [];

    workerCheckbox.type = 'checkbox';
    workerCheckbox.addEventListener('input', () => {
      checkedStatesReadOnInput.push(workerCheckbox.checked);
    });
    mountWorkerElements(workerCheckbox);

    const hostCheckbox = container.querySelector('input') as HTMLInputElement;

    await act(async () => {
      await user.click(hostCheckbox);
      connection.flush();
    });

    expect(checkedStatesReadOnInput).toEqual([true]);
    expect(workerCheckbox.checked).toBe(true);
    expect(hostCheckbox.checked).toBe(true);
  });

  it('should keep the value an input listener rewrites while the user types', async () => {
    const workerInput = createWorkerElement('html-input');

    workerInput.addEventListener('input', () => {
      workerInput.value = String(workerInput.value).toUpperCase();
    });
    mountWorkerElements(workerInput);

    const hostInput = container.querySelector('input') as HTMLInputElement;

    await pressKeysWithEchoAfterEach(hostInput, ['a', 'b']);

    expect(workerInput.value).toBe('AB');
    expect(hostInput.value).toBe('AB');
  });

  it('should keep a checkbox unchecked when a click listener vetoes the toggle', async () => {
    const workerCheckbox = createWorkerElement('html-input') as WorkerCheckbox;

    workerCheckbox.type = 'checkbox';
    workerCheckbox.addEventListener('click', () => {
      workerCheckbox.checked = false;
    });
    mountWorkerElements(workerCheckbox);

    const hostCheckbox = container.querySelector('input') as HTMLInputElement;

    await act(async () => {
      await user.click(hostCheckbox);
      connection.flush();
    });

    expect(workerCheckbox.checked).toBe(false);
    expect(hostCheckbox.checked).toBe(false);
  });

  it('should clear the host file input every time a change listener resets it after reading the file', async () => {
    const workerFileInput = createWorkerElement(
      'html-input',
    ) as WorkerFileInput;
    const fileNamesReadOnChange: string[] = [];

    workerFileInput.type = 'file';
    workerFileInput.addEventListener('change', () => {
      fileNamesReadOnChange.push(workerFileInput.files?.[0]?.name ?? '');
      workerFileInput.value = '';
    });
    mountWorkerElements(workerFileInput);

    const hostFileInput = container.querySelector('input') as HTMLInputElement;

    for (const fileName of ['avatar.png', 'avatar.png']) {
      await act(async () => {
        await user.upload(hostFileInput, new File(['image'], fileName));
        connection.flush();
      });

      expect(hostFileInput.value).toBe('');
    }

    expect(fileNamesReadOnChange).toEqual(['avatar.png', 'avatar.png']);
  });
});
