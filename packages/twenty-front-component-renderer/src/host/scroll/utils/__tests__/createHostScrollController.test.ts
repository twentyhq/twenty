import { isDefined } from 'twenty-shared/utils';

import { latestNativeEditSequenceByHostElement } from '@/host/caret/states/latestNativeEditSequenceByHostElement';
import { MAX_PENDING_SCROLL_COMMANDS } from '@/constants/MaxPendingScrollCommands';
import { createHostScrollController } from '@/host/scroll/utils/createHostScrollController';
import { createGeometryTrackerStub } from '@/testing/createGeometryTrackerStub';

type AppliedScrollTo = {
  remoteElementId: string;
  scrollToOptions: ScrollToOptions;
};

const createScrollToCommand = ({
  sequence,
  top,
  left,
}: {
  sequence: number;
  top?: number;
  left?: number;
}) => ({
  sequence,
  request: { method: 'scrollTo', top, left },
});

const flushScrollCommands = () => Promise.resolve();

const createScrollControllerFixture = () => {
  const geometryTracker = createGeometryTrackerStub();
  const registeredNodesByRemoteElementId = new Map<string, Element>();
  const appliedScrollTos: AppliedScrollTo[] = [];

  jest
    .mocked(geometryTracker.getRegisteredNode)
    .mockImplementation((remoteElementId) =>
      registeredNodesByRemoteElementId.get(remoteElementId),
    );
  jest
    .mocked(geometryTracker.findRemoteElementIdContainingNode)
    .mockImplementation((node) => {
      for (const [
        remoteElementId,
        registeredNode,
      ] of registeredNodesByRemoteElementId) {
        if (registeredNode === node) {
          return remoteElementId;
        }
      }

      return undefined;
    });

  const registerScrollableElement = (remoteElementId: string) => {
    const element = document.createElement('div');
    const scrollTo = jest.fn((scrollToOptions: ScrollToOptions) => {
      appliedScrollTos.push({ remoteElementId, scrollToOptions });

      if (isDefined(scrollToOptions.top)) {
        element.scrollTop = scrollToOptions.top;
      }

      if (isDefined(scrollToOptions.left)) {
        element.scrollLeft = scrollToOptions.left;
      }
    });

    Object.defineProperty(element, 'scrollTo', {
      value: scrollTo,
      configurable: true,
    });
    document.body.append(element);
    registeredNodesByRemoteElementId.set(remoteElementId, element);

    return { element, scrollTo };
  };

  return {
    controller: createHostScrollController({ geometryTracker }),
    registerScrollableElement,
    appliedScrollTos,
  };
};

describe('createHostScrollController', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('should apply the commands of every element in global sequence order on the next microtask', async () => {
    const { controller, registerScrollableElement, appliedScrollTos } =
      createScrollControllerFixture();

    registerScrollableElement('first');
    registerScrollableElement('second');
    controller.enqueueScrollCommands({
      remoteElementId: 'first',
      scrollCommands: [
        createScrollToCommand({ sequence: 3, top: 30 }),
        createScrollToCommand({ sequence: 1, top: 10 }),
      ],
      onScrollUpdate: jest.fn(),
    });
    controller.enqueueScrollCommands({
      remoteElementId: 'second',
      scrollCommands: [createScrollToCommand({ sequence: 2, top: 20 })],
      onScrollUpdate: jest.fn(),
    });

    expect(appliedScrollTos).toHaveLength(0);

    await flushScrollCommands();

    expect(appliedScrollTos).toEqual([
      {
        remoteElementId: 'first',
        scrollToOptions: { top: 10, behavior: 'instant' },
      },
      {
        remoteElementId: 'second',
        scrollToOptions: { top: 20, behavior: 'instant' },
      },
      {
        remoteElementId: 'first',
        scrollToOptions: { top: 30, behavior: 'instant' },
      },
    ]);
  });

  it('should not apply a sequence again when the same commands are enqueued repeatedly', async () => {
    const { controller, registerScrollableElement } =
      createScrollControllerFixture();
    const { scrollTo } = registerScrollableElement('list');
    const scrollCommands = [createScrollToCommand({ sequence: 1, top: 10 })];
    const onScrollUpdate = jest.fn();

    controller.enqueueScrollCommands({
      remoteElementId: 'list',
      scrollCommands,
      onScrollUpdate,
    });
    controller.enqueueScrollCommands({
      remoteElementId: 'list',
      scrollCommands,
      onScrollUpdate,
    });
    await flushScrollCommands();
    controller.enqueueScrollCommands({
      remoteElementId: 'list',
      scrollCommands,
      onScrollUpdate,
    });
    await flushScrollCommands();

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(onScrollUpdate).toHaveBeenCalledTimes(1);
  });

  it('should apply only the commands newer than the last applied sequence of an element', async () => {
    const { controller, registerScrollableElement } =
      createScrollControllerFixture();
    const { scrollTo } = registerScrollableElement('list');
    const onScrollUpdate = jest.fn();

    controller.enqueueScrollCommands({
      remoteElementId: 'list',
      scrollCommands: [createScrollToCommand({ sequence: 1, top: 10 })],
      onScrollUpdate,
    });
    await flushScrollCommands();
    controller.enqueueScrollCommands({
      remoteElementId: 'list',
      scrollCommands: [
        createScrollToCommand({ sequence: 1, top: 10 }),
        createScrollToCommand({ sequence: 2, top: 20 }),
      ],
      onScrollUpdate,
    });
    await flushScrollCommands();

    expect(scrollTo.mock.calls).toEqual([
      [{ top: 10, behavior: 'instant' }],
      [{ top: 20, behavior: 'instant' }],
    ]);
    expect(onScrollUpdate).toHaveBeenLastCalledWith({
      scrollCommandSequence: 2,
      scrollPositions: [
        { remoteElementId: 'list', scrollTop: 20, scrollLeft: 0 },
      ],
    });
  });

  it('should acknowledge each element once with its highest sequence and its scroll position after the flush', async () => {
    const { controller, registerScrollableElement } =
      createScrollControllerFixture();
    const onFirstScrollUpdate = jest.fn();
    const onSecondScrollUpdate = jest.fn();

    registerScrollableElement('first');
    registerScrollableElement('second');
    controller.enqueueScrollCommands({
      remoteElementId: 'first',
      scrollCommands: [
        createScrollToCommand({ sequence: 1, top: 10 }),
        createScrollToCommand({ sequence: 3, top: 30, left: 5 }),
      ],
      onScrollUpdate: onFirstScrollUpdate,
    });
    controller.enqueueScrollCommands({
      remoteElementId: 'second',
      scrollCommands: [createScrollToCommand({ sequence: 2, left: 15 })],
      onScrollUpdate: onSecondScrollUpdate,
    });
    await flushScrollCommands();

    expect(onFirstScrollUpdate).toHaveBeenCalledTimes(1);
    expect(onFirstScrollUpdate).toHaveBeenCalledWith({
      scrollCommandSequence: 3,
      scrollPositions: [
        { remoteElementId: 'first', scrollTop: 30, scrollLeft: 5 },
      ],
    });
    expect(onSecondScrollUpdate).toHaveBeenCalledTimes(1);
    expect(onSecondScrollUpdate).toHaveBeenCalledWith({
      scrollCommandSequence: 2,
      scrollPositions: [
        { remoteElementId: 'second', scrollTop: 0, scrollLeft: 15 },
      ],
    });
  });

  it('should acknowledge without scrolling a command for an element that is not registered', async () => {
    const { controller, appliedScrollTos } = createScrollControllerFixture();
    const onScrollUpdate = jest.fn();

    controller.enqueueScrollCommands({
      remoteElementId: 'missing',
      scrollCommands: [createScrollToCommand({ sequence: 4, top: 40 })],
      onScrollUpdate,
    });
    await flushScrollCommands();

    expect(appliedScrollTos).toHaveLength(0);
    expect(onScrollUpdate).toHaveBeenCalledWith({
      scrollCommandSequence: 4,
      scrollPositions: [],
    });
  });

  it('should acknowledge without scrolling a command for an element that is disconnected', async () => {
    const { controller, registerScrollableElement } =
      createScrollControllerFixture();
    const { element, scrollTo } = registerScrollableElement('detached');
    const onScrollUpdate = jest.fn();

    element.remove();
    controller.enqueueScrollCommands({
      remoteElementId: 'detached',
      scrollCommands: [createScrollToCommand({ sequence: 1, top: 40 })],
      onScrollUpdate,
    });
    await flushScrollCommands();

    expect(scrollTo).not.toHaveBeenCalled();
    expect(onScrollUpdate).toHaveBeenCalledWith({
      scrollCommandSequence: 1,
      scrollPositions: [],
    });
  });

  it('should acknowledge without scrolling a command whose request is invalid', async () => {
    const { controller, registerScrollableElement } =
      createScrollControllerFixture();
    const { scrollTo } = registerScrollableElement('list');
    const onScrollUpdate = jest.fn();

    controller.enqueueScrollCommands({
      remoteElementId: 'list',
      scrollCommands: [
        { sequence: 1, request: { method: 'scrollBy', top: 5 } },
      ],
      onScrollUpdate,
    });
    await flushScrollCommands();

    expect(scrollTo).not.toHaveBeenCalled();
    expect(onScrollUpdate).toHaveBeenCalledWith({
      scrollCommandSequence: 1,
      scrollPositions: [],
    });
  });

  it('should apply scroll commands to an element the user edited natively', async () => {
    const { controller, registerScrollableElement } =
      createScrollControllerFixture();
    const { element, scrollTo } = registerScrollableElement('textarea');
    const onScrollUpdate = jest.fn();

    latestNativeEditSequenceByHostElement.set(element, 5);
    controller.enqueueScrollCommands({
      remoteElementId: 'textarea',
      scrollCommands: [
        {
          sequence: 1,
          acknowledgedNativeEditSequence: 4,
          request: { method: 'scrollTo', top: 10 },
        },
        { sequence: 2, request: { method: 'scrollTo', top: 20 } },
      ],
      onScrollUpdate,
    });
    await flushScrollCommands();

    expect(scrollTo.mock.calls).toEqual([
      [{ top: 10, behavior: 'instant' }],
      [{ top: 20, behavior: 'instant' }],
    ]);
    expect(onScrollUpdate).toHaveBeenCalledWith({
      scrollCommandSequence: 2,
      scrollPositions: [
        { remoteElementId: 'textarea', scrollTop: 20, scrollLeft: 0 },
      ],
    });
  });

  it('should apply every command of a large batch across elements in sequence order', async () => {
    const { controller, registerScrollableElement, appliedScrollTos } =
      createScrollControllerFixture();
    const remoteElementIds = ['first', 'second', 'third'];
    const onScrollUpdates = remoteElementIds.map(() => jest.fn());

    for (const remoteElementId of remoteElementIds) {
      registerScrollableElement(remoteElementId);
    }

    for (const [elementIndex, remoteElementId] of remoteElementIds.entries()) {
      controller.enqueueScrollCommands({
        remoteElementId,
        scrollCommands: Array.from(
          { length: MAX_PENDING_SCROLL_COMMANDS },
          (_, commandIndex) =>
            createScrollToCommand({
              sequence:
                commandIndex * remoteElementIds.length + elementIndex + 1,
              top: commandIndex + 1,
            }),
        ),
        onScrollUpdate: onScrollUpdates[elementIndex],
      });
    }
    await flushScrollCommands();

    expect(appliedScrollTos).toHaveLength(
      MAX_PENDING_SCROLL_COMMANDS * remoteElementIds.length,
    );
    expect(
      appliedScrollTos
        .slice(0, remoteElementIds.length)
        .map(({ remoteElementId }) => remoteElementId),
    ).toEqual(remoteElementIds);

    for (const [elementIndex, remoteElementId] of remoteElementIds.entries()) {
      expect(onScrollUpdates[elementIndex]).toHaveBeenCalledWith({
        scrollCommandSequence:
          (MAX_PENDING_SCROLL_COMMANDS - 1) * remoteElementIds.length +
          elementIndex +
          1,
        scrollPositions: [
          {
            remoteElementId,
            scrollTop: MAX_PENDING_SCROLL_COMMANDS,
            scrollLeft: 0,
          },
        ],
      });
    }
  });

  it('should only consider the latest pending commands of an element', async () => {
    const { controller, registerScrollableElement } =
      createScrollControllerFixture();
    const { scrollTo } = registerScrollableElement('element');
    const extraCommandCount = 8;

    controller.enqueueScrollCommands({
      remoteElementId: 'element',
      scrollCommands: Array.from(
        { length: MAX_PENDING_SCROLL_COMMANDS + extraCommandCount },
        (_, commandIndex) =>
          createScrollToCommand({
            sequence: commandIndex + 1,
            top: commandIndex + 1,
          }),
      ),
      onScrollUpdate: jest.fn(),
    });
    await flushScrollCommands();

    expect(scrollTo).toHaveBeenCalledTimes(MAX_PENDING_SCROLL_COMMANDS);
    expect(scrollTo).toHaveBeenNthCalledWith(1, {
      top: extraCommandCount + 1,
      behavior: 'instant',
    });
  });

  it('should forget the applied sequence of an element once its pending commands are cleared', async () => {
    const { controller, registerScrollableElement } =
      createScrollControllerFixture();
    const { scrollTo } = registerScrollableElement('element');
    const scrollCommands = [createScrollToCommand({ sequence: 5, top: 50 })];

    controller.enqueueScrollCommands({
      remoteElementId: 'element',
      scrollCommands,
      onScrollUpdate: jest.fn(),
    });
    await flushScrollCommands();
    controller.enqueueScrollCommands({
      remoteElementId: 'element',
      scrollCommands,
      onScrollUpdate: jest.fn(),
    });
    await flushScrollCommands();

    expect(scrollTo).toHaveBeenCalledTimes(1);

    controller.enqueueScrollCommands({
      remoteElementId: 'element',
      scrollCommands: [],
      onScrollUpdate: jest.fn(),
    });
    await flushScrollCommands();
    controller.enqueueScrollCommands({
      remoteElementId: 'element',
      scrollCommands,
      onScrollUpdate: jest.fn(),
    });
    await flushScrollCommands();

    expect(scrollTo).toHaveBeenCalledTimes(2);
  });

  it('should not apply the commands enqueued before a reset', async () => {
    const { controller, registerScrollableElement } =
      createScrollControllerFixture();
    const { scrollTo } = registerScrollableElement('list');
    const onScrollUpdate = jest.fn();

    controller.enqueueScrollCommands({
      remoteElementId: 'list',
      scrollCommands: [createScrollToCommand({ sequence: 1, top: 10 })],
      onScrollUpdate,
    });
    controller.reset();
    await flushScrollCommands();

    expect(scrollTo).not.toHaveBeenCalled();
    expect(onScrollUpdate).not.toHaveBeenCalled();
  });

  it('should flush the commands enqueued right after a reset that cancelled a pending flush', async () => {
    const { controller, registerScrollableElement } =
      createScrollControllerFixture();
    const { scrollTo } = registerScrollableElement('list');

    controller.enqueueScrollCommands({
      remoteElementId: 'list',
      scrollCommands: [createScrollToCommand({ sequence: 1, top: 10 })],
      onScrollUpdate: jest.fn(),
    });
    controller.reset();
    controller.enqueueScrollCommands({
      remoteElementId: 'list',
      scrollCommands: [createScrollToCommand({ sequence: 1, top: 20 })],
      onScrollUpdate: jest.fn(),
    });
    await flushScrollCommands();

    expect(scrollTo.mock.calls).toEqual([[{ top: 20, behavior: 'instant' }]]);
  });

  it('should apply an already applied sequence again after a reset', async () => {
    const { controller, registerScrollableElement } =
      createScrollControllerFixture();
    const { scrollTo } = registerScrollableElement('list');
    const scrollCommands = [createScrollToCommand({ sequence: 1, top: 10 })];

    controller.enqueueScrollCommands({
      remoteElementId: 'list',
      scrollCommands,
      onScrollUpdate: jest.fn(),
    });
    await flushScrollCommands();
    controller.reset();
    controller.enqueueScrollCommands({
      remoteElementId: 'list',
      scrollCommands,
      onScrollUpdate: jest.fn(),
    });
    await flushScrollCommands();

    expect(scrollTo).toHaveBeenCalledTimes(2);
  });

  it('should still scroll and acknowledge other elements when an element has no scroll update function', async () => {
    const { controller, registerScrollableElement } =
      createScrollControllerFixture();
    const { scrollTo: firstScrollTo } = registerScrollableElement('first');
    const onSecondScrollUpdate = jest.fn();

    registerScrollableElement('second');
    controller.enqueueScrollCommands({
      remoteElementId: 'first',
      scrollCommands: [createScrollToCommand({ sequence: 1, top: 10 })],
      onScrollUpdate: 'not a function',
    });
    controller.enqueueScrollCommands({
      remoteElementId: 'second',
      scrollCommands: [createScrollToCommand({ sequence: 2, top: 20 })],
      onScrollUpdate: onSecondScrollUpdate,
    });
    await flushScrollCommands();

    expect(firstScrollTo).toHaveBeenCalledTimes(1);
    expect(onSecondScrollUpdate).toHaveBeenCalledWith({
      scrollCommandSequence: 2,
      scrollPositions: [
        { remoteElementId: 'second', scrollTop: 20, scrollLeft: 0 },
      ],
    });
  });
});
