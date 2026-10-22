import { updateRemoteElementProperty } from '@remote-dom/core/elements';
import { isFunction } from '@sniptt/guards';

import { MAX_PENDING_SCROLL_COMMANDS } from '@/constants/MaxPendingScrollCommands';
import { REMOTE_RENDER_CONTAINER_TAG } from '@/constants/RemoteRenderContainerTag';
import { SCROLL_BRIDGE_PROPERTIES } from '@/constants/ScrollBridgeProperties';
import { NODE_TYPE_BY_NAME } from '@/polyfills/dom/constants/NodeTypeByName';
import { createWorkerScrollStore } from '@/polyfills/scroll/utils/createWorkerScrollStore';
import { createElementGeometrySnapshotFixture } from '@/testing/createElementGeometrySnapshotFixture';
import { createWorkerGeometryStoreStub } from '@/testing/createWorkerGeometryStoreStub';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';
import { type ScrollCommandAcknowledgement } from '@/types/ScrollCommandAcknowledgement';

type FakeRemoteNode = {
  parentNode: object | null;
  localName: string;
  nodeType: number;
};

type ScrollUpdateHandler = (
  acknowledgement: ScrollCommandAcknowledgement,
) => void;

const remoteElementIdByNode = new WeakMap<object, string>();

jest.mock('@remote-dom/core/elements', () => ({
  remoteId: (node: object) =>
    remoteElementIdByNode.get(node) ?? 'unregistered-remote-element',
  updateRemoteElementProperty: jest.fn(),
}));

const updateRemoteElementPropertyMock = jest.mocked(
  updateRemoteElementProperty,
);

const createFakeRemoteNode = ({
  parentNode,
  remoteElementId,
  localName = 'html-div',
}: {
  parentNode: object | null;
  remoteElementId: string;
  localName?: string;
}): FakeRemoteNode => {
  const fakeRemoteNode = {
    parentNode,
    localName,
    nodeType: NODE_TYPE_BY_NAME.ELEMENT,
  };

  remoteElementIdByNode.set(fakeRemoteNode, remoteElementId);

  return fakeRemoteNode;
};

const createScrollStoreEnvironment = () => {
  const snapshotByElement = new Map<object, ElementGeometrySnapshot>();
  const resolveElementSnapshot = jest.fn(
    (element: object) => snapshotByElement.get(element) ?? null,
  );
  const scrollStore = createWorkerScrollStore({
    geometryStore: createWorkerGeometryStoreStub({ resolveElementSnapshot }),
  });
  const rootElement = createFakeRemoteNode({
    parentNode: null,
    remoteElementId: 'root',
    localName: 'remote-root',
  });
  const scrollContainer = createFakeRemoteNode({
    parentNode: rootElement,
    remoteElementId: 'scroll-container',
  });
  const scrolledItem = createFakeRemoteNode({
    parentNode: scrollContainer,
    remoteElementId: 'scrolled-item',
  });

  snapshotByElement.set(
    scrollContainer,
    createElementGeometrySnapshotFixture(),
  );
  snapshotByElement.set(
    scrolledItem,
    createElementGeometrySnapshotFixture({ scrollTop: 0, scrollLeft: 0 }),
  );
  scrollStore.setRootElement(rootElement);

  return {
    scrollStore,
    snapshotByElement,
    resolveElementSnapshot,
    rootElement,
    scrollContainer,
    scrolledItem,
  };
};

const readBridgePropertyValues = ({
  element,
  bridgeProperty,
}: {
  element: object;
  bridgeProperty: string;
}): unknown[] =>
  updateRemoteElementPropertyMock.mock.calls
    .filter(
      ([updatedElement, updatedProperty]) =>
        updatedElement === element && updatedProperty === bridgeProperty,
    )
    .map(([, , value]) => value);

const readSentScrollQueues = (element: object): unknown[] =>
  readBridgePropertyValues({
    element,
    bridgeProperty: SCROLL_BRIDGE_PROPERTIES.request,
  });

const readLatestScrollUpdateHandler = (
  element: object,
): ScrollUpdateHandler => {
  const scrollUpdateHandlers = readBridgePropertyValues({
    element,
    bridgeProperty: SCROLL_BRIDGE_PROPERTIES.update,
  });
  const latestScrollUpdateHandler =
    scrollUpdateHandlers[scrollUpdateHandlers.length - 1];

  if (!isFunction<ScrollUpdateHandler, unknown>(latestScrollUpdateHandler)) {
    throw new Error('Expected a host scroll subscription for the element');
  }

  return latestScrollUpdateHandler;
};

describe('createWorkerScrollStore', () => {
  beforeEach(() => {
    updateRemoteElementPropertyMock.mockClear();
  });

  it('should send nothing for the remote root, a render container or a detached element', () => {
    const { scrollStore, rootElement } = createScrollStoreEnvironment();
    const renderContainer = createFakeRemoteNode({
      parentNode: rootElement,
      remoteElementId: 'render-container',
      localName: REMOTE_RENDER_CONTAINER_TAG,
    });
    const detachedElement = createFakeRemoteNode({
      parentNode: null,
      remoteElementId: 'detached-element',
    });

    for (const element of [rootElement, renderContainer, detachedElement]) {
      scrollStore.requestScroll({
        element,
        request: { method: 'scrollTo', top: 40 },
      });
      scrollStore.requestScroll({
        element,
        request: {
          method: 'scrollIntoView',
          block: 'start',
          inline: 'nearest',
        },
      });
    }

    expect(updateRemoteElementPropertyMock).not.toHaveBeenCalled();
  });

  it('should send nothing before the remote root is known', () => {
    const scrollStore = createWorkerScrollStore({
      geometryStore: createWorkerGeometryStoreStub(),
    });
    const element = createFakeRemoteNode({
      parentNode: {},
      remoteElementId: 'element',
    });

    scrollStore.requestScroll({
      element,
      request: { method: 'scrollTo', top: 40 },
    });

    expect(updateRemoteElementPropertyMock).not.toHaveBeenCalled();
  });

  it('should not resolve the geometry snapshot when writing to an element that was never read', () => {
    const { scrollStore, resolveElementSnapshot, scrollContainer } =
      createScrollStoreEnvironment();

    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: 40 },
    });

    expect(resolveElementSnapshot).not.toHaveBeenCalled();
  });

  it('should read the geometry offset of an element that is not a scroll command target', () => {
    const { scrollStore, snapshotByElement, rootElement } =
      createScrollStoreEnvironment();
    snapshotByElement.set(
      rootElement,
      createElementGeometrySnapshotFixture({ scrollTop: 7 }),
    );

    expect(
      scrollStore.readScrollOffset({ element: rootElement, axis: 'top' }),
    ).toBe(7);
  });

  it('should enqueue scrollTo commands on the request bridge property and subscribe to host updates once', () => {
    const { scrollStore, scrollContainer } = createScrollStoreEnvironment();

    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: 40 },
    });
    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', left: 10 },
    });

    expect(updateRemoteElementPropertyMock.mock.calls).toEqual([
      [scrollContainer, SCROLL_BRIDGE_PROPERTIES.update, expect.any(Function)],
      [
        scrollContainer,
        SCROLL_BRIDGE_PROPERTIES.request,
        [{ sequence: 1, request: { method: 'scrollTo', top: 40 } }],
      ],
      [
        scrollContainer,
        SCROLL_BRIDGE_PROPERTIES.request,
        [
          { sequence: 1, request: { method: 'scrollTo', top: 40 } },
          { sequence: 2, request: { method: 'scrollTo', left: 10 } },
        ],
      ],
    ]);
  });

  it('should drop the oldest pending scroll command once the pending limit is exceeded', () => {
    const { scrollStore, scrollContainer } = createScrollStoreEnvironment();

    for (
      let requestedOffset = 1;
      requestedOffset <= MAX_PENDING_SCROLL_COMMANDS + 1;
      requestedOffset += 1
    ) {
      scrollStore.requestScroll({
        element: scrollContainer,
        request: { method: 'scrollTo', top: requestedOffset },
      });
    }

    const sentScrollQueues = readSentScrollQueues(scrollContainer);

    expect(sentScrollQueues[sentScrollQueues.length - 1]).toEqual(
      Array.from(
        { length: MAX_PENDING_SCROLL_COMMANDS },
        (_, commandIndex) => ({
          sequence: commandIndex + 2,
          request: { method: 'scrollTo', top: commandIndex + 2 },
        }),
      ),
    );
  });

  it('should return the requested offset immediately after a write', () => {
    const { scrollStore, scrollContainer } = createScrollStoreEnvironment();

    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: 120 },
    });

    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'top' }),
    ).toBe(120);
    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'left' }),
    ).toBe(16);
  });

  it('should return a negative right-to-left scroll left as written until the host acknowledges it', () => {
    const { scrollStore, scrollContainer } = createScrollStoreEnvironment();

    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', left: -120 },
    });

    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'left' }),
    ).toBe(-120);
  });

  it('should trim acknowledged commands and resend the remaining ones', () => {
    const { scrollStore, scrollContainer } = createScrollStoreEnvironment();

    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: 40 },
    });
    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: 80 },
    });
    const handleScrollUpdate = readLatestScrollUpdateHandler(scrollContainer);
    updateRemoteElementPropertyMock.mockClear();

    handleScrollUpdate({
      scrollCommandSequence: 1,
      scrollPositions: [
        { remoteElementId: 'scroll-container', scrollTop: 40, scrollLeft: 16 },
      ],
    });

    expect(readSentScrollQueues(scrollContainer)).toEqual([
      [{ sequence: 2, request: { method: 'scrollTo', top: 80 } }],
    ]);
    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'top' }),
    ).toBe(80);
  });

  it('should read the acknowledged position once every command is acknowledged', () => {
    const { scrollStore, scrollContainer } = createScrollStoreEnvironment();

    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: 400 },
    });
    const handleScrollUpdate = readLatestScrollUpdateHandler(scrollContainer);
    updateRemoteElementPropertyMock.mockClear();

    handleScrollUpdate({
      scrollCommandSequence: 1,
      scrollPositions: [
        { remoteElementId: 'scroll-container', scrollTop: 250, scrollLeft: 0 },
      ],
    });

    expect(readSentScrollQueues(scrollContainer)).toEqual([[]]);
    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'top' }),
    ).toBe(250);
    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'left' }),
    ).toBe(0);
  });

  it('should read the acknowledged position when the element has no geometry snapshot', () => {
    const { scrollStore, snapshotByElement, scrollContainer } =
      createScrollStoreEnvironment();
    snapshotByElement.delete(scrollContainer);

    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: 40 },
    });
    readLatestScrollUpdateHandler(scrollContainer)({
      scrollCommandSequence: 1,
      scrollPositions: [
        { remoteElementId: 'scroll-container', scrollTop: 35, scrollLeft: 0 },
      ],
    });

    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'top' }),
    ).toBe(35);
  });

  it('should let a newer geometry snapshot supersede an acknowledged position', () => {
    const { scrollStore, snapshotByElement, scrollContainer } =
      createScrollStoreEnvironment();

    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: 40 },
    });
    readLatestScrollUpdateHandler(scrollContainer)({
      scrollCommandSequence: 1,
      scrollPositions: [
        { remoteElementId: 'scroll-container', scrollTop: 40, scrollLeft: 0 },
      ],
    });

    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'top' }),
    ).toBe(40);

    snapshotByElement.set(
      scrollContainer,
      createElementGeometrySnapshotFixture({ scrollTop: 90, scrollLeft: 3 }),
    );

    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'top' }),
    ).toBe(90);
    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'left' }),
    ).toBe(3);
  });

  it('should record an acknowledged ancestor position on that ancestor and enrol it for geometry', () => {
    const {
      scrollStore,
      resolveElementSnapshot,
      scrollContainer,
      scrolledItem,
    } = createScrollStoreEnvironment();

    scrollStore.requestScroll({
      element: scrolledItem,
      request: { method: 'scrollIntoView', block: 'center', inline: 'nearest' },
    });

    expect(resolveElementSnapshot).not.toHaveBeenCalledWith(scrollContainer);

    readLatestScrollUpdateHandler(scrolledItem)({
      scrollCommandSequence: 1,
      scrollPositions: [
        { remoteElementId: 'scroll-container', scrollTop: 200, scrollLeft: 0 },
      ],
    });

    expect(resolveElementSnapshot).toHaveBeenCalledWith(scrollContainer);
    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'top' }),
    ).toBe(200);
    expect(
      scrollStore.readScrollOffset({ element: scrolledItem, axis: 'top' }),
    ).toBe(0);
  });

  it('should ignore acknowledged positions outside the scrolled element ancestor chain', () => {
    const {
      scrollStore,
      snapshotByElement,
      resolveElementSnapshot,
      rootElement,
      scrolledItem,
    } = createScrollStoreEnvironment();
    const siblingElement = createFakeRemoteNode({
      parentNode: rootElement,
      remoteElementId: 'sibling-element',
    });
    snapshotByElement.set(
      siblingElement,
      createElementGeometrySnapshotFixture(),
    );

    scrollStore.requestScroll({
      element: scrolledItem,
      request: { method: 'scrollIntoView', block: 'start', inline: 'nearest' },
    });
    readLatestScrollUpdateHandler(scrolledItem)({
      scrollCommandSequence: 1,
      scrollPositions: [
        { remoteElementId: 'sibling-element', scrollTop: 300, scrollLeft: 0 },
        { remoteElementId: 'root', scrollTop: 300, scrollLeft: 0 },
      ],
    });

    expect(resolveElementSnapshot).not.toHaveBeenCalledWith(siblingElement);
    expect(resolveElementSnapshot).not.toHaveBeenCalledWith(rootElement);
    expect(
      scrollStore.readScrollOffset({ element: siblingElement, axis: 'top' }),
    ).toBe(15);
  });

  it('should elide a write that echoes the last read offset', () => {
    const { scrollStore, scrollContainer } = createScrollStoreEnvironment();

    const readScrollTop = scrollStore.readScrollOffset({
      element: scrollContainer,
      axis: 'top',
    });
    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: readScrollTop },
    });

    expect(readScrollTop).toBe(15);
    expect(updateRemoteElementPropertyMock).not.toHaveBeenCalled();
  });

  it('should send only the axes that differ from the last read offsets', () => {
    const { scrollStore, scrollContainer } = createScrollStoreEnvironment();

    scrollStore.readScrollOffset({ element: scrollContainer, axis: 'top' });
    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: 15, left: 30 },
    });

    expect(readSentScrollQueues(scrollContainer)).toEqual([
      [{ sequence: 1, request: { method: 'scrollTo', left: 30 } }],
    ]);
  });

  it('should send a zero write to an element that was never read even when its snapshot is already at zero', () => {
    const { scrollStore, scrolledItem } = createScrollStoreEnvironment();

    scrollStore.requestScroll({
      element: scrolledItem,
      request: { method: 'scrollTo', top: 0 },
    });

    expect(readSentScrollQueues(scrolledItem)).toEqual([
      [{ sequence: 1, request: { method: 'scrollTo', top: 0 } }],
    ]);
  });

  it('should send a write of the last read offset after the host position moved away from it', () => {
    const { scrollStore, snapshotByElement, scrollContainer } =
      createScrollStoreEnvironment();

    scrollStore.readScrollOffset({ element: scrollContainer, axis: 'top' });
    snapshotByElement.set(
      scrollContainer,
      createElementGeometrySnapshotFixture({ scrollTop: 50 }),
    );
    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: 15 },
    });

    expect(readSentScrollQueues(scrollContainer)).toEqual([
      [{ sequence: 1, request: { method: 'scrollTo', top: 15 } }],
    ]);
  });

  it('should send a write of the last read offset after a pending write moved away from it', () => {
    const { scrollStore, scrollContainer } = createScrollStoreEnvironment();

    scrollStore.readScrollOffset({ element: scrollContainer, axis: 'top' });
    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: 40 },
    });
    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: 15 },
    });

    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'top' }),
    ).toBe(15);
    expect(readSentScrollQueues(scrollContainer)).toEqual([
      [{ sequence: 1, request: { method: 'scrollTo', top: 40 } }],
      [
        { sequence: 1, request: { method: 'scrollTo', top: 40 } },
        { sequence: 2, request: { method: 'scrollTo', top: 15 } },
      ],
    ]);
  });

  it('should send a write echoing an acknowledged position while the element has no geometry snapshot', () => {
    const { scrollStore, snapshotByElement, scrollContainer } =
      createScrollStoreEnvironment();
    snapshotByElement.delete(scrollContainer);

    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: 120 },
    });
    readLatestScrollUpdateHandler(scrollContainer)({
      scrollCommandSequence: 1,
      scrollPositions: [
        { remoteElementId: 'scroll-container', scrollTop: 120, scrollLeft: 0 },
      ],
    });
    const readScrollTop = scrollStore.readScrollOffset({
      element: scrollContainer,
      axis: 'top',
    });
    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: readScrollTop },
    });

    expect(readScrollTop).toBe(120);
    expect(readSentScrollQueues(scrollContainer)).toEqual([
      [{ sequence: 1, request: { method: 'scrollTo', top: 120 } }],
      [],
      [{ sequence: 2, request: { method: 'scrollTo', top: 120 } }],
    ]);
  });

  it('should elide a write echoing a pending write on an element without a geometry snapshot', () => {
    const { scrollStore, snapshotByElement, scrollContainer } =
      createScrollStoreEnvironment();
    snapshotByElement.delete(scrollContainer);

    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: 40 },
    });
    const readScrollTop = scrollStore.readScrollOffset({
      element: scrollContainer,
      axis: 'top',
    });
    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: readScrollTop },
    });

    expect(readScrollTop).toBe(40);
    expect(readSentScrollQueues(scrollContainer)).toEqual([
      [{ sequence: 1, request: { method: 'scrollTo', top: 40 } }],
    ]);
  });

  it('should send a restore of the last read offset while a descendant reveal is pending', () => {
    const { scrollStore, scrollContainer, scrolledItem } =
      createScrollStoreEnvironment();

    const savedScrollTop = scrollStore.readScrollOffset({
      element: scrollContainer,
      axis: 'top',
    });
    scrollStore.requestScroll({
      element: scrolledItem,
      request: {
        method: 'scrollIntoView',
        block: 'nearest',
        inline: 'nearest',
      },
    });
    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: savedScrollTop },
    });

    expect(readSentScrollQueues(scrollContainer)).toEqual([
      [
        {
          sequence: 2,
          request: { method: 'scrollTo', top: savedScrollTop },
        },
      ],
    ]);
  });

  it('should elide echoed writes again once the descendant reveal is acknowledged', () => {
    const { scrollStore, scrollContainer, scrolledItem } =
      createScrollStoreEnvironment();

    scrollStore.requestScroll({
      element: scrolledItem,
      request: {
        method: 'scrollIntoView',
        block: 'nearest',
        inline: 'nearest',
      },
    });
    readLatestScrollUpdateHandler(scrolledItem)({
      scrollCommandSequence: 1,
      scrollPositions: [],
    });

    const readScrollTop = scrollStore.readScrollOffset({
      element: scrollContainer,
      axis: 'top',
    });
    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: readScrollTop },
    });

    expect(readSentScrollQueues(scrollContainer)).toEqual([]);
  });

  it('should never elide scrollIntoView requests', () => {
    const { scrollStore, scrollContainer } = createScrollStoreEnvironment();

    scrollStore.readScrollOffset({ element: scrollContainer, axis: 'top' });
    scrollStore.readScrollOffset({ element: scrollContainer, axis: 'left' });
    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollIntoView', block: 'start', inline: 'nearest' },
    });
    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollIntoView', block: 'start', inline: 'nearest' },
    });

    expect(readSentScrollQueues(scrollContainer)).toEqual([
      [
        {
          sequence: 1,
          request: {
            method: 'scrollIntoView',
            block: 'start',
            inline: 'nearest',
          },
        },
      ],
      [
        {
          sequence: 1,
          request: {
            method: 'scrollIntoView',
            block: 'start',
            inline: 'nearest',
          },
        },
        {
          sequence: 2,
          request: {
            method: 'scrollIntoView',
            block: 'start',
            inline: 'nearest',
          },
        },
      ],
    ]);
    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'top' }),
    ).toBe(15);
  });

  it('should expose event scroll state synchronously and clear it after a microtask', async () => {
    const { scrollStore, scrollContainer } = createScrollStoreEnvironment();

    scrollStore.observeEventTarget({
      element: scrollContainer,
      eventData: {
        type: 'scroll',
        scrollTop: 300,
        scrollLeft: 4,
        scrollWidth: 900,
        clientWidth: 200,
      },
    });

    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'top' }),
    ).toBe(300);
    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'left' }),
    ).toBe(4);
    expect(
      scrollStore.readEventScrollExtent({
        element: scrollContainer,
        extent: 'scrollWidth',
      }),
    ).toBe(900);
    expect(
      scrollStore.readEventScrollExtent({
        element: scrollContainer,
        extent: 'clientWidth',
      }),
    ).toBe(200);

    await Promise.resolve();

    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'top' }),
    ).toBe(15);
    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'left' }),
    ).toBe(16);
    expect(
      scrollStore.readEventScrollExtent({
        element: scrollContainer,
        extent: 'scrollWidth',
      }),
    ).toBeUndefined();
  });

  it('should ignore event data without scroll state', () => {
    const { scrollStore, scrollContainer } = createScrollStoreEnvironment();

    scrollStore.observeEventTarget({
      element: scrollContainer,
      eventData: { type: 'click', clientX: 3 },
    });

    expect(
      scrollStore.readEventScrollExtent({
        element: scrollContainer,
        extent: 'scrollWidth',
      }),
    ).toBeUndefined();
    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'top' }),
    ).toBe(15);
  });

  it('should discard the pending commands of a detached element after a microtask sweep', async () => {
    const { scrollStore, scrollContainer } = createScrollStoreEnvironment();

    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: 40 },
    });
    scrollContainer.parentNode = null;
    updateRemoteElementPropertyMock.mockClear();

    scrollStore.scheduleDetachedElementSweep();

    expect(updateRemoteElementPropertyMock).not.toHaveBeenCalled();

    await Promise.resolve();

    expect(readSentScrollQueues(scrollContainer)).toEqual([[]]);
    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'top' }),
    ).toBe(15);
  });

  it('should keep the pending commands of elements still attached during a sweep', async () => {
    const { scrollStore, scrollContainer } = createScrollStoreEnvironment();

    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: 40 },
    });
    updateRemoteElementPropertyMock.mockClear();

    scrollStore.scheduleDetachedElementSweep();
    await Promise.resolve();

    expect(updateRemoteElementPropertyMock).not.toHaveBeenCalled();
    expect(
      scrollStore.readScrollOffset({ element: scrollContainer, axis: 'top' }),
    ).toBe(40);
  });

  it('should ignore an acknowledgement for an element detached from the remote root', () => {
    const { scrollStore, scrollContainer } = createScrollStoreEnvironment();

    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: 40 },
    });
    const handleScrollUpdate = readLatestScrollUpdateHandler(scrollContainer);
    scrollContainer.parentNode = null;
    updateRemoteElementPropertyMock.mockClear();

    handleScrollUpdate({
      scrollCommandSequence: 1,
      scrollPositions: [
        { remoteElementId: 'scroll-container', scrollTop: 40, scrollLeft: 0 },
      ],
    });

    expect(updateRemoteElementPropertyMock).not.toHaveBeenCalled();
  });

  it('should ignore an acknowledgement from a subscription replaced by a detached element sweep', async () => {
    const { scrollStore, rootElement, scrollContainer } =
      createScrollStoreEnvironment();

    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: 40 },
    });
    const staleScrollUpdateHandler =
      readLatestScrollUpdateHandler(scrollContainer);
    scrollContainer.parentNode = null;
    scrollStore.scheduleDetachedElementSweep();
    await Promise.resolve();
    scrollContainer.parentNode = rootElement;
    scrollStore.requestScroll({
      element: scrollContainer,
      request: { method: 'scrollTo', top: 70 },
    });
    const currentScrollUpdateHandler =
      readLatestScrollUpdateHandler(scrollContainer);
    updateRemoteElementPropertyMock.mockClear();

    staleScrollUpdateHandler({
      scrollCommandSequence: 2,
      scrollPositions: [
        { remoteElementId: 'scroll-container', scrollTop: 70, scrollLeft: 0 },
      ],
    });

    expect(currentScrollUpdateHandler).not.toBe(staleScrollUpdateHandler);
    expect(updateRemoteElementPropertyMock).not.toHaveBeenCalled();

    currentScrollUpdateHandler({
      scrollCommandSequence: 2,
      scrollPositions: [
        { remoteElementId: 'scroll-container', scrollTop: 70, scrollLeft: 0 },
      ],
    });

    expect(readSentScrollQueues(scrollContainer)).toEqual([[]]);
  });
});
