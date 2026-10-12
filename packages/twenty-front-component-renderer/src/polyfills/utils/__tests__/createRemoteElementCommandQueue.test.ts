import { updateRemoteElementProperty } from '@remote-dom/core/elements';

import { createRemoteElementCommandQueue } from '@/polyfills/utils/createRemoteElementCommandQueue';
import { type InputSelectionRequest } from '@/types/InputSelectionRequest';
import { type ScrollRequest } from '@/types/ScrollRequest';

jest.mock('@remote-dom/core/elements', () => ({
  updateRemoteElementProperty: jest.fn(),
}));

const updateRemoteElementPropertyMock = jest.mocked(
  updateRemoteElementProperty,
);

describe('createRemoteElementCommandQueue', () => {
  beforeEach(() => {
    updateRemoteElementPropertyMock.mockClear();
  });

  it('should number commands in request order across elements', () => {
    const commandQueue = createRemoteElementCommandQueue<InputSelectionRequest>(
      {
        bridgeProperty: 'request',
      },
    );
    const firstElement = {};
    const secondElement = {};

    commandQueue.enqueueCommand({
      element: firstElement,
      request: { method: 'select' },
    });
    commandQueue.enqueueCommand({
      element: secondElement,
      request: { method: 'select' },
    });
    commandQueue.enqueueCommand({
      element: firstElement,
      request: { property: 'selectionEnd', value: 2 },
    });

    expect(commandQueue.readPendingCommands(firstElement)).toEqual([
      { sequence: 1, request: { method: 'select' } },
      { sequence: 3, request: { property: 'selectionEnd', value: 2 } },
    ]);
    expect(commandQueue.readPendingCommands(secondElement)).toEqual([
      { sequence: 2, request: { method: 'select' } },
    ]);
  });

  it('should not resend the queue when the host acknowledges no new command', () => {
    const commandQueue = createRemoteElementCommandQueue<InputSelectionRequest>(
      {
        bridgeProperty: 'request',
      },
    );
    const element = {};

    commandQueue.enqueueCommand({ element, request: { method: 'select' } });
    updateRemoteElementPropertyMock.mockClear();
    commandQueue.acknowledgeCommands({
      element,
      acknowledgedCommandSequence: 0,
    });

    expect(updateRemoteElementPropertyMock).not.toHaveBeenCalled();
    expect(commandQueue.readPendingCommands(element)).toHaveLength(1);
  });

  it('should keep and send only the latest commands when the pending limit is reached', () => {
    const commandQueue = createRemoteElementCommandQueue<ScrollRequest>({
      bridgeProperty: 'scrollRequest',
      maxPendingCommands: 2,
    });
    const element = {};

    commandQueue.enqueueCommand({
      element,
      request: { method: 'scrollTo', top: 10 },
    });
    commandQueue.enqueueCommand({
      element,
      request: { method: 'scrollTo', top: 20 },
    });
    commandQueue.enqueueCommand({
      element,
      request: { method: 'scrollIntoView', block: 'end', inline: 'nearest' },
    });

    const latestCommands = [
      { sequence: 2, request: { method: 'scrollTo', top: 20 } },
      {
        sequence: 3,
        request: { method: 'scrollIntoView', block: 'end', inline: 'nearest' },
      },
    ];

    expect(commandQueue.readPendingCommands(element)).toEqual(latestCommands);
    expect(updateRemoteElementPropertyMock).toHaveBeenCalledTimes(3);
    expect(updateRemoteElementPropertyMock).toHaveBeenLastCalledWith(
      element,
      'scrollRequest',
      latestCommands,
    );
  });

  it('should send nothing when discarding an element without pending commands', () => {
    const commandQueue = createRemoteElementCommandQueue<InputSelectionRequest>(
      {
        bridgeProperty: 'request',
      },
    );

    commandQueue.discardPendingCommands({});

    expect(updateRemoteElementPropertyMock).not.toHaveBeenCalled();
  });
});
