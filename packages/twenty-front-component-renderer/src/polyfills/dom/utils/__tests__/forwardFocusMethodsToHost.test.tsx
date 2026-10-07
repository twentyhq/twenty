import '@/remote/generated/remote-elements';

import {
  BatchingRemoteConnection,
  remoteId,
  type RemoteRootElement,
} from '@remote-dom/core/elements';
import { RemoteReceiver } from '@remote-dom/core/receivers';
import {
  createRemoteComponentRenderer,
  RemoteRootRenderer,
} from '@remote-dom/react/host';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { createHtmlHostWrapper } from '@/host/elements/utils/createHtmlHostWrapper';
import { FrontComponentHostFocusControllerContext } from '@/host/focus/contexts/FrontComponentHostFocusControllerContext';
import { createFocusAwareRemoteConnection } from '@/host/focus/utils/createFocusAwareRemoteConnection';
import { createHostFocusController } from '@/host/focus/utils/createHostFocusController';
import { FrontComponentGeometryTrackerContext } from '@/host/geometry/contexts/FrontComponentGeometryTrackerContext';
import { createGeometryTracker } from '@/host/geometry/utils/createGeometryTracker';

import { createWorkerActiveElementStore } from '../createWorkerActiveElementStore';
import { createWorkerFocusTransport } from '../createWorkerFocusTransport';
import { installFocusAndBlurMethodsPolyfill } from '../installFocusAndBlurMethodsPolyfill';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe('forwarding focus methods to the host', () => {
  let container: HTMLDivElement;
  let root: Root;
  let remoteRoot: RemoteRootElement;

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

  const renderRemoteButtons = () => {
    const receiver = new RemoteReceiver();
    const geometryTracker = createGeometryTracker();
    const hostFocusController = createHostFocusController({
      geometryTracker,
    });
    const connection = new BatchingRemoteConnection(
      createFocusAwareRemoteConnection({
        connection: receiver.connection,
        hostFocusController,
      }),
      { batch: jest.fn() },
    );
    const activeElementStore = createWorkerActiveElementStore();
    const focusTransport = createWorkerFocusTransport();
    const firstItem = document.createElement(
      'html-button',
    ) as HTMLButtonElement;
    const secondItem = document.createElement(
      'html-button',
    ) as HTMLButtonElement;
    const handleSecondItemKeyDown = jest.fn();

    firstItem.textContent = 'First';
    secondItem.textContent = 'Second';
    secondItem.addEventListener('keydown', handleSecondItemKeyDown);
    remoteRoot.append(firstItem, secondItem);
    remoteRoot.connect(connection);
    focusTransport.setRootElement(remoteRoot);

    for (const element of [firstItem, secondItem]) {
      installFocusAndBlurMethodsPolyfill({
        elementPrototype: element,
        activeElementStore,
        forwardFocusMethod: focusTransport.forwardFocusMethod,
      });
    }

    act(() => {
      root.render(
        <FrontComponentGeometryTrackerContext.Provider value={geometryTracker}>
          <FrontComponentHostFocusControllerContext.Provider
            value={hostFocusController}
          >
            <RemoteRootRenderer
              receiver={receiver}
              components={
                new Map([
                  [
                    'html-button',
                    createRemoteComponentRenderer(
                      createHtmlHostWrapper('button'),
                    ),
                  ],
                ])
              }
            />
          </FrontComponentHostFocusControllerContext.Provider>
        </FrontComponentGeometryTrackerContext.Provider>,
      );
    });

    return {
      connection,
      activeElementStore,
      firstItem,
      secondItem,
      handleSecondItemKeyDown,
    };
  };

  it('should move host focus and route the next keyboard event to the focused item', () => {
    const {
      connection,
      activeElementStore,
      firstItem,
      secondItem,
      handleSecondItemKeyDown,
    } = renderRemoteButtons();

    expect(() => firstItem.focus()).not.toThrow();
    expect(container.querySelector('button')).toBeNull();
    act(() => connection.flush());

    const hostButtons = container.querySelectorAll('button');
    const firstHostButton = hostButtons[0];
    const secondHostButton = hostButtons[1];
    const focusSecondHostButton = jest.spyOn(secondHostButton, 'focus');

    expect(document.activeElement).toBe(firstHostButton);
    expect(() => connection.call(remoteId(firstItem), 'click')).toThrow(
      'Front components cannot call click() on host elements',
    );

    act(() => secondItem.focus({ preventScroll: true }));
    expect(document.activeElement).toBe(secondHostButton);
    expect(activeElementStore.getActiveElement()).toBe(secondItem);
    expect(focusSecondHostButton).toHaveBeenCalledWith({ preventScroll: true });

    act(() => {
      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
    });
    expect(handleSecondItemKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'ArrowDown' }),
    );

    act(() => secondItem.blur());
    expect(document.activeElement).toBe(document.body);
    expect(activeElementStore.getActiveElement()).toBeNull();
  });

  it('should retry focus after queued properties enable a mounted host button', () => {
    const { connection, secondItem } = renderRemoteButtons();

    secondItem.disabled = true;
    act(() => connection.flush());

    const secondHostButton = container.querySelectorAll('button')[1];

    expect(secondHostButton.disabled).toBe(true);
    secondItem.disabled = false;
    act(() => secondItem.focus());
    expect(document.activeElement).toBe(document.body);

    act(() => connection.flush());

    expect(secondHostButton.disabled).toBe(false);
    expect(document.activeElement).toBe(secondHostButton);
  });

  it('should keep focus local for elements outside the remote render root', () => {
    const activeElementStore = createWorkerActiveElementStore();
    const focusTransport = createWorkerFocusTransport();
    const button = document.createElement('button');

    container.append(button);
    focusTransport.setRootElement(remoteRoot);
    installFocusAndBlurMethodsPolyfill({
      elementPrototype: button,
      activeElementStore,
      forwardFocusMethod: focusTransport.forwardFocusMethod,
    });

    expect(() => button.focus()).not.toThrow();
    expect(activeElementStore.getActiveElement()).toBe(button);
    expect(document.activeElement).toBe(document.body);
  });
});
