import { updateRemoteElementProperty } from '@remote-dom/core/elements';

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

  it('should send nothing when discarding an element without pending commands', () => {
    const commandQueue = createInputSelectionCommandQueue();

    commandQueue.discardPendingCommands({});

    expect(updateRemoteElementPropertyMock).not.toHaveBeenCalled();
  });
});
