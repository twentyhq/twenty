import {
  MUTATION_TYPE_INSERT_CHILD,
  MUTATION_TYPE_REMOVE_CHILD,
  NODE_TYPE_ELEMENT,
  NODE_TYPE_TEXT,
  ROOT_ID,
  type RemoteElementSerialization,
} from '@remote-dom/core';
import {
  RemoteReceiver,
  RemoteFragmentRenderer,
  createRemoteComponentRenderer,
} from '@remote-dom/react/host';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';

import { REMOTE_RENDER_CONTAINER_TAG } from '@/constants/RemoteRenderContainerTag';
import { createHtmlHostWrapper } from '@/host/elements/utils/createHtmlHostWrapper';
import { FrontComponentRemoteRootRenderer } from '../FrontComponentRemoteRootRenderer';

const components = new Map([
  [REMOTE_RENDER_CONTAINER_TAG, RemoteFragmentRenderer],
  [
    'html-button',
    createRemoteComponentRenderer(createHtmlHostWrapper('button')),
  ],
]);

const createButton = ({
  id,
  name,
  onClick = () => {},
}: {
  id: string;
  name: string;
  onClick?: () => void;
}): RemoteElementSerialization => ({
  id,
  type: NODE_TYPE_ELEMENT,
  element: 'html-button',
  eventListeners: { click: onClick },
  children: [{ id: `${id}-text`, type: NODE_TYPE_TEXT, data: name }],
});

const createReceiverWithRootChildren = (
  rootChildren: RemoteElementSerialization[],
) => {
  const receiver = new RemoteReceiver();
  receiver.connection.mutate(
    rootChildren.map((rootChild, rootChildIndex) => [
      MUTATION_TYPE_INSERT_CHILD,
      ROOT_ID,
      rootChild,
      rootChildIndex,
    ]),
  );

  return receiver;
};

const renderRootRenderer = (receiver: RemoteReceiver) =>
  render(
    <FrontComponentRemoteRootRenderer
      receiver={receiver}
      components={components}
    />,
  );

describe('FrontComponentRemoteRootRenderer', () => {
  it('renders and removes body portal content with working callbacks', async () => {
    const onClick = jest.fn();
    const receiver = createReceiverWithRootChildren([
      createButton({ id: 'portal', name: 'Portal action', onClick }),
    ]);
    renderRootRenderer(receiver);

    await userEvent.click(
      screen.getByRole('button', { name: 'Portal action' }),
    );
    expect(onClick).toHaveBeenCalledTimes(1);

    act(() =>
      receiver.connection.mutate([[MUTATION_TYPE_REMOVE_CHILD, ROOT_ID, 0]]),
    );
    expect(screen.queryByRole('button', { name: 'Portal action' })).toBeNull();
  });

  it('renders component content in place and body portals outside the component', () => {
    const { container } = renderRootRenderer(
      createReceiverWithRootChildren([
        {
          id: 'content',
          type: NODE_TYPE_ELEMENT,
          element: REMOTE_RENDER_CONTAINER_TAG,
          children: [createButton({ id: 'trigger', name: 'Trigger' })],
        },
        createButton({ id: 'portal', name: 'Popup' }),
      ]),
    );

    expect(
      within(container).getByRole('button', { name: 'Trigger' }),
    ).toBeDefined();
    expect(
      within(container).queryByRole('button', { name: 'Popup' }),
    ).toBeNull();
    expect(screen.getByRole('button', { name: 'Popup' })).toBeDefined();
  });

  it('does not remove a second receiver portal with the same remote ID', () => {
    const firstReceiver = createReceiverWithRootChildren([
      createButton({ id: 'portal', name: 'First popup' }),
    ]);
    renderRootRenderer(firstReceiver);
    renderRootRenderer(
      createReceiverWithRootChildren([
        createButton({ id: 'portal', name: 'Second popup' }),
      ]),
    );

    act(() =>
      firstReceiver.connection.mutate([
        [MUTATION_TYPE_REMOVE_CHILD, ROOT_ID, 0],
      ]),
    );
    expect(screen.queryByRole('button', { name: 'First popup' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Second popup' })).toBeDefined();
  });
});
