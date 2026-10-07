import { updateRemoteElementProperty } from '@remote-dom/core/elements';

import { INPUT_SELECTION_BRIDGE_PROPERTIES } from '@/constants/InputSelectionBridgeProperties';

import { createInputSelectionCommandQueue } from '../createInputSelectionCommandQueue';

jest.mock('@remote-dom/core/elements', () => ({
  updateRemoteElementProperty: jest.fn(),
}));

const updateRemoteElementPropertyMock = jest.mocked(
  updateRemoteElementProperty,
);

describe('createInputSelectionCommandQueue', () => {
  beforeEach(() => {
    updateRemoteElementPropertyMock.mockClear();
  });

  it('should number commands in request order across elements', () => {
    const commandQueue = createInputSelectionCommandQueue();
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

  it('should send the whole pending queue to the host on every request', () => {
    const commandQueue = createInputSelectionCommandQueue();
    const element = {};

    commandQueue.enqueueCommand({ element, request: { method: 'select' } });
    commandQueue.enqueueCommand({
      element,
      request: { property: 'selectionStart', value: 1 },
    });

    expect(updateRemoteElementPropertyMock).toHaveBeenLastCalledWith(
      element,
      INPUT_SELECTION_BRIDGE_PROPERTIES.request,
      [
        { sequence: 1, request: { method: 'select' } },
        { sequence: 2, request: { property: 'selectionStart', value: 1 } },
      ],
    );
  });

  it('should drop only the commands the host acknowledged', () => {
    const commandQueue = createInputSelectionCommandQueue();
    const element = {};

    commandQueue.enqueueCommand({ element, request: { method: 'select' } });
    commandQueue.enqueueCommand({ element, request: { method: 'select' } });
    commandQueue.enqueueCommand({ element, request: { method: 'select' } });
    commandQueue.acknowledgeCommands({
      element,
      acknowledgedCommandSequence: 2,
    });

    expect(commandQueue.readPendingCommands(element)).toEqual([
      { sequence: 3, request: { method: 'select' } },
    ]);
    expect(updateRemoteElementPropertyMock).toHaveBeenLastCalledWith(
      element,
      INPUT_SELECTION_BRIDGE_PROPERTIES.request,
      [{ sequence: 3, request: { method: 'select' } }],
    );
  });

  it('should not resend the queue when the host acknowledges no new command', () => {
    const commandQueue = createInputSelectionCommandQueue();
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

  it('should send an empty queue when discarding pending commands', () => {
    const commandQueue = createInputSelectionCommandQueue();
    const element = {};

    commandQueue.enqueueCommand({ element, request: { method: 'select' } });
    updateRemoteElementPropertyMock.mockClear();
    commandQueue.discardPendingCommands(element);

    expect(updateRemoteElementPropertyMock).toHaveBeenCalledWith(
      element,
      INPUT_SELECTION_BRIDGE_PROPERTIES.request,
      [],
    );
    expect(commandQueue.readPendingCommands(element)).toEqual([]);
  });

  it('should send nothing when discarding an element without pending commands', () => {
    const commandQueue = createInputSelectionCommandQueue();

    commandQueue.discardPendingCommands({});

    expect(updateRemoteElementPropertyMock).not.toHaveBeenCalled();
  });
});
