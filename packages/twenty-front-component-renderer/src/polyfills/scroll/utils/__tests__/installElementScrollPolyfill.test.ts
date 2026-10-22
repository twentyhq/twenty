import { installElementGeometryPolyfill } from '@/polyfills/geometry/utils/installElementGeometryPolyfill';
import { type WorkerScrollStore } from '@/polyfills/scroll/types/WorkerScrollStore';
import { installElementScrollPolyfill } from '@/polyfills/scroll/utils/installElementScrollPolyfill';
import { createElementGeometrySnapshotFixture } from '@/testing/createElementGeometrySnapshotFixture';
import { createWorkerGeometryStoreStub } from '@/testing/createWorkerGeometryStoreStub';

class ScrollPolyfilledElement {
  declare scrollTop: number;
  declare scrollLeft: number;
  declare scrollWidth: number;
  declare scrollHeight: number;
  declare clientWidth: number;
  declare scrollTo: (...scrollToArguments: unknown[]) => void;
  declare scroll: (...scrollArguments: unknown[]) => void;
  declare scrollIntoView: (scrollIntoViewArgument?: unknown) => void;
}

const createScrollStoreMock = (): jest.Mocked<WorkerScrollStore> => {
  const scrollStore: jest.Mocked<WorkerScrollStore> = {
    setRootElement: jest.fn(),
    readScrollOffset: jest.fn(),
    readEventScrollExtent: jest.fn(),
    requestScroll: jest.fn(),
    observeEventTarget: jest.fn(),
    scheduleDetachedElementSweep: jest.fn(),
  };

  scrollStore.readScrollOffset.mockReturnValue(0);

  return scrollStore;
};

const installScrollPolyfillsOnFakeElement = () => {
  class FakeElement extends ScrollPolyfilledElement {}

  const scrollStore = createScrollStoreMock();

  installElementGeometryPolyfill({
    elementPrototype: FakeElement.prototype,
    documentTarget: {},
    geometryStore: createWorkerGeometryStoreStub({
      resolveElementSnapshot: () => createElementGeometrySnapshotFixture(),
    }),
  });
  installElementScrollPolyfill({
    elementPrototype: FakeElement.prototype,
    scrollStore,
  });

  return {
    element: new FakeElement(),
    elementPrototype: FakeElement.prototype,
    scrollStore,
  };
};

describe('installElementScrollPolyfill', () => {
  it('should read offsets from the scroll store', () => {
    const { element, scrollStore } = installScrollPolyfillsOnFakeElement();
    scrollStore.readScrollOffset.mockImplementation(({ axis }) =>
      axis === 'top' ? 120 : 30,
    );

    expect(element.scrollTop).toBe(120);
    expect(element.scrollLeft).toBe(30);
    expect(scrollStore.readScrollOffset.mock.calls).toEqual([
      [{ element, axis: 'top' }],
      [{ element, axis: 'left' }],
    ]);
  });

  it('should request a scrollTo from the offset setters', () => {
    const { element, scrollStore } = installScrollPolyfillsOnFakeElement();

    element.scrollTop = 40;
    element.scrollLeft = 12;

    expect(scrollStore.requestScroll.mock.calls).toEqual([
      [{ element, request: { method: 'scrollTo', top: 40 } }],
      [{ element, request: { method: 'scrollTo', left: 12 } }],
    ]);
  });

  it('should normalize non-finite and non-numeric offsets written to the setters', () => {
    const { element, scrollStore } = installScrollPolyfillsOnFakeElement();

    element.scrollTop = Number.NaN;
    element.scrollLeft = Number.POSITIVE_INFINITY;
    Reflect.set(element, 'scrollTop', '25');

    expect(scrollStore.requestScroll.mock.calls).toEqual([
      [{ element, request: { method: 'scrollTo', top: 0 } }],
      [{ element, request: { method: 'scrollTo', left: 0 } }],
      [{ element, request: { method: 'scrollTo', top: 25 } }],
    ]);
  });

  it('should map scrollTo coordinates and scroll options to scrollTo requests', () => {
    const { element, scrollStore } = installScrollPolyfillsOnFakeElement();

    element.scrollTo(10, 20);
    element.scrollTo({ top: 30 });
    element.scroll({ left: 5 });

    expect(scrollStore.requestScroll.mock.calls).toEqual([
      [{ element, request: { method: 'scrollTo', left: 10, top: 20 } }],
      [{ element, request: { method: 'scrollTo', top: 30 } }],
      [{ element, request: { method: 'scrollTo', left: 5 } }],
    ]);
  });

  it('should send nothing when scrollTo is called without offsets', () => {
    const { element, scrollStore } = installScrollPolyfillsOnFakeElement();

    element.scrollTo();
    element.scrollTo({});
    element.scroll(null);

    expect(scrollStore.requestScroll).not.toHaveBeenCalled();
  });

  it('should throw a TypeError when scrollTo receives a single non-object argument', () => {
    const { element, scrollStore } = installScrollPolyfillsOnFakeElement();

    expect(() => element.scrollTo(5)).toThrow(TypeError);
    expect(scrollStore.requestScroll).not.toHaveBeenCalled();
  });

  it('should map scrollIntoView arguments to block and inline alignments', () => {
    const { element, scrollStore } = installScrollPolyfillsOnFakeElement();

    element.scrollIntoView();
    element.scrollIntoView(false);
    element.scrollIntoView({ block: 'center' });

    expect(scrollStore.requestScroll.mock.calls).toEqual([
      [
        {
          element,
          request: {
            method: 'scrollIntoView',
            block: 'start',
            inline: 'nearest',
          },
        },
      ],
      [
        {
          element,
          request: {
            method: 'scrollIntoView',
            block: 'end',
            inline: 'nearest',
          },
        },
      ],
      [
        {
          element,
          request: {
            method: 'scrollIntoView',
            block: 'center',
            inline: 'nearest',
          },
        },
      ],
    ]);
  });

  it('should throw a TypeError when scrollIntoView receives an unknown alignment', () => {
    const { element, scrollStore } = installScrollPolyfillsOnFakeElement();

    expect(() => element.scrollIntoView({ inline: 'middle' })).toThrow(
      TypeError,
    );
    expect(scrollStore.requestScroll).not.toHaveBeenCalled();
  });

  it('should prefer an event scroll extent over the geometry extent', () => {
    const { element, scrollStore } = installScrollPolyfillsOnFakeElement();
    scrollStore.readEventScrollExtent.mockImplementation(({ extent }) =>
      extent === 'scrollWidth' ? 900 : undefined,
    );

    expect(element.scrollWidth).toBe(900);
    expect(element.clientWidth).toBe(9);
    expect(scrollStore.readEventScrollExtent).toHaveBeenCalledWith({
      element,
      extent: 'clientWidth',
    });
  });

  it('should keep an event scroll extent of zero', () => {
    const { element, scrollStore } = installScrollPolyfillsOnFakeElement();
    scrollStore.readEventScrollExtent.mockReturnValue(0);

    expect(element.scrollWidth).toBe(0);
    expect(element.clientWidth).toBe(0);
  });

  it('should fall back to the geometry extents when no event extent is known', () => {
    const { element } = installScrollPolyfillsOnFakeElement();

    expect(element.scrollWidth).toBe(13);
    expect(element.clientWidth).toBe(9);
  });

  it('should define scrollTo, scroll and scrollIntoView as methods on the element prototype', () => {
    const { elementPrototype } = installScrollPolyfillsOnFakeElement();

    for (const methodName of ['scrollTo', 'scroll', 'scrollIntoView']) {
      expect(
        Object.getOwnPropertyDescriptor(elementPrototype, methodName),
      ).toEqual(
        expect.objectContaining({
          value: expect.any(Function),
          writable: true,
          configurable: true,
        }),
      );
    }
  });

  it('should fall back to zero extents when no geometry getter was installed before it', () => {
    class BareElement extends ScrollPolyfilledElement {}

    installElementScrollPolyfill({
      elementPrototype: BareElement.prototype,
      scrollStore: createScrollStoreMock(),
    });

    const element = new BareElement();

    expect(element.scrollWidth).toBe(0);
    expect(element.clientWidth).toBe(0);
  });
});
