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
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';

import { createHtmlHostWrapper } from '@/host/elements/utils/createHtmlHostWrapper';
import { FrontComponentRemoteRootRenderer } from '../FrontComponentRemoteRootRenderer';

const components = new Map([
  ['remote-fragment', RemoteFragmentRenderer],
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

describe('FrontComponentRemoteRootRenderer', () => {
  it('renders and removes body portal content with working callbacks', async () => {
    const receiver = new RemoteReceiver();
    const onClick = jest.fn();
    receiver.connection.mutate([
      [
        MUTATION_TYPE_INSERT_CHILD,
        ROOT_ID,
        createButton({ id: 'portal', name: 'Portal action', onClick }),
        0,
      ],
    ]);
    render(
      <FrontComponentRemoteRootRenderer
        receiver={receiver}
        components={components}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Portal action' }),
    );
    expect(onClick).toHaveBeenCalledTimes(1);

    act(() =>
      receiver.connection.mutate([[MUTATION_TYPE_REMOVE_CHILD, ROOT_ID, 0]]),
    );
    expect(screen.queryByRole('button', { name: 'Portal action' })).toBeNull();
  });

  it('keeps the normal render fragment separate from the portal layer', () => {
    const receiver = new RemoteReceiver();
    receiver.connection.mutate([
      [
        MUTATION_TYPE_INSERT_CHILD,
        ROOT_ID,
        {
          id: 'content',
          type: NODE_TYPE_ELEMENT,
          element: 'remote-fragment',
          children: [createButton({ id: 'trigger', name: 'Trigger' })],
        },
        0,
      ],
      [
        MUTATION_TYPE_INSERT_CHILD,
        ROOT_ID,
        createButton({ id: 'portal', name: 'Popup' }),
        1,
      ],
    ]);
    const { container } = render(
      <FrontComponentRemoteRootRenderer
        receiver={receiver}
        components={components}
      />,
    );

    expect(screen.getByRole('button', { name: 'Trigger' }).parentElement).toBe(
      container,
    );
    expect(
      screen.getByRole('button', { name: 'Popup' }).parentElement,
    ).not.toBe(container);
  });

  it('does not remove a second receiver portal with the same remote ID', () => {
    const firstReceiver = new RemoteReceiver();
    const secondReceiver = new RemoteReceiver();
    firstReceiver.connection.mutate([
      [
        MUTATION_TYPE_INSERT_CHILD,
        ROOT_ID,
        createButton({ id: 'portal', name: 'First popup' }),
        0,
      ],
    ]);
    secondReceiver.connection.mutate([
      [
        MUTATION_TYPE_INSERT_CHILD,
        ROOT_ID,
        createButton({ id: 'portal', name: 'Second popup' }),
        0,
      ],
    ]);
    render(
      <>
        <FrontComponentRemoteRootRenderer
          receiver={firstReceiver}
          components={components}
        />
        <FrontComponentRemoteRootRenderer
          receiver={secondReceiver}
          components={components}
        />
      </>,
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
