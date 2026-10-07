import '@/remote/generated/remote-elements';

import {
  BatchingRemoteConnection,
  RemoteMutationObserver,
  type RemoteRootElement,
} from '@remote-dom/core/elements';
import { RemoteReceiver } from '@remote-dom/core/receivers';
import {
  createRemoteComponentRenderer,
  RemoteRootRenderer,
} from '@remote-dom/react/host';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { isDefined } from 'twenty-shared/utils';

import { createHtmlHostWrapper } from '@/host/elements/utils/createHtmlHostWrapper';
import { workerInputSelectionStore } from '@/polyfills/input-selection/states/workerInputSelectionStore';
import { type WorkerInputSelectionStore } from '@/polyfills/input-selection/types/WorkerInputSelectionStore';
import { installInputSelectionPolyfill } from '@/polyfills/input-selection/utils/installInputSelectionPolyfill';

type TextControl = HTMLInputElement | HTMLTextAreaElement;

export const createRemoteTextControlRenderer = () => {
  const mountedRoots: Root[] = [];
  const appendedElements: Element[] = [];
  const remoteMutationObservers: RemoteMutationObserver[] = [];

  const renderRemoteControl = ({
    htmlTag,
    type,
    selectionStore = workerInputSelectionStore,
    shouldReadBeforeConnect = true,
  }: {
    htmlTag: 'input' | 'textarea';
    type?: string;
    selectionStore?: WorkerInputSelectionStore;
    shouldReadBeforeConnect?: boolean;
  }) => {
    const container = document.createElement('div');
    const remoteRoot = document.createElement(
      'remote-root',
    ) as RemoteRootElement;
    const remoteControl = document.createElement(
      `html-${htmlTag}`,
    ) as unknown as TextControl;
    const remoteSibling = document.createElement(
      'html-div',
    ) as unknown as HTMLElement;
    const root = createRoot(container);
    const receiver = new RemoteReceiver();
    const scheduleBatch = jest.fn();
    const connection = new BatchingRemoteConnection(receiver.connection, {
      batch: scheduleBatch,
    });
    const remoteMutationObserver = new RemoteMutationObserver(connection);

    document.body.append(container, remoteRoot);
    mountedRoots.push(root);
    appendedElements.push(container, remoteRoot);
    remoteMutationObservers.push(remoteMutationObserver);

    if (isDefined(type)) {
      remoteControl.setAttribute('type', type);
    }

    remoteControl.value = 'initial';
    remoteControl.addEventListener('change', jest.fn());
    remoteRoot.append(remoteControl, remoteSibling);
    selectionStore.setRootElement(remoteRoot);
    installInputSelectionPolyfill({
      elementPrototypes: [remoteControl],
      selectionStore,
    });

    if (shouldReadBeforeConnect) {
      selectionStore.read(remoteControl);
    }

    remoteRoot.connect(connection);
    remoteMutationObserver.observe(remoteRoot, { initial: false });

    act(() => {
      connection.flush();
      root.render(
        <RemoteRootRenderer
          receiver={receiver}
          components={
            new Map([
              [
                `html-${htmlTag}`,
                createRemoteComponentRenderer(createHtmlHostWrapper(htmlTag)),
              ],
              [
                'html-div',
                createRemoteComponentRenderer(createHtmlHostWrapper('div')),
              ],
            ])
          }
        />,
      );
    });

    const hostControl = container.querySelector(htmlTag) as TextControl;

    scheduleBatch.mockClear();

    return {
      container,
      connection,
      hostControl,
      remoteControl,
      remoteRoot,
      remoteSibling,
      root,
      scheduleBatch,
      selectionStore,
    };
  };

  const unmountRenderedRemoteControls = (): void => {
    for (const remoteMutationObserver of remoteMutationObservers.splice(0)) {
      remoteMutationObserver.disconnect();
    }

    for (const root of mountedRoots.splice(0)) {
      act(() => root.unmount());
    }

    for (const appendedElement of appendedElements.splice(0)) {
      appendedElement.remove();
    }
  };

  return { renderRemoteControl, unmountRenderedRemoteControls };
};
