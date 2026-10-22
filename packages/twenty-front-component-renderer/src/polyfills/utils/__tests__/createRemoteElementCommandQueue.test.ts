import { updateRemoteElementProperty } from '@remote-dom/core/elements';

import { NODE_TYPE_BY_NAME } from '@/polyfills/dom/constants/NodeTypeByName';
import { createRemoteElementCommandQueue } from '@/polyfills/utils/createRemoteElementCommandQueue';
import { type InputSelectionRequest } from '@/types/InputSelectionRequest';

jest.mock('@remote-dom/core/elements', () => ({
  updateRemoteElementProperty: jest.fn(),
}));

const updateRemoteElementPropertyMock = jest.mocked(
  updateRemoteElementProperty,
);

const createElementStub = () => ({ nodeType: NODE_TYPE_BY_NAME.ELEMENT });

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
    const firstElement = createElementStub();
    const secondElement = createElementStub();

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
    const element = createElementStub();

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
    const commandQueue = createRemoteElementCommandQueue<InputSelectionRequest>(
      {
        bridgeProperty: 'request',
        maxPendingCommands: 2,
      },
    );
    const element = createElementStub();

    commandQueue.enqueueCommand({
      element,
      request: { property: 'selectionStart', value: 1 },
    });
    commandQueue.enqueueCommand({
      element,
      request: { property: 'selectionEnd', value: 2 },
    });
    commandQueue.enqueueCommand({ element, request: { method: 'select' } });

    const latestCommands = [
      { sequence: 2, request: { property: 'selectionEnd', value: 2 } },
      { sequence: 3, request: { method: 'select' } },
    ];

    expect(commandQueue.readPendingCommands(element)).toEqual(latestCommands);
    expect(updateRemoteElementPropertyMock).toHaveBeenCalledTimes(3);
    expect(updateRemoteElementPropertyMock).toHaveBeenLastCalledWith(
      element,
      'request',
      latestCommands,
    );
  });

  it('should send nothing when discarding an element without pending commands', () => {
    const commandQueue = createRemoteElementCommandQueue<InputSelectionRequest>(
      {
        bridgeProperty: 'request',
      },
    );

    commandQueue.discardPendingCommands(createElementStub());

    expect(updateRemoteElementPropertyMock).not.toHaveBeenCalled();
  });

  it('should not write the bridge property for a non-element object', () => {
    const commandQueue = createRemoteElementCommandQueue<InputSelectionRequest>(
      {
        bridgeProperty: 'request',
      },
    );
    const nonElement = {};

    commandQueue.enqueueCommand({
      element: nonElement,
      request: { method: 'select' },
    });

    expect(updateRemoteElementPropertyMock).not.toHaveBeenCalled();
    expect(commandQueue.readPendingCommands(nonElement)).toHaveLength(1);
  });
});
