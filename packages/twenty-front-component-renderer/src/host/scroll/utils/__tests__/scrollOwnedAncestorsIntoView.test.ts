import { scrollOwnedAncestorsIntoView } from '@/host/scroll/utils/scrollOwnedAncestorsIntoView';

type ScrollComputedStyle = Pick<
  CSSStyleDeclaration,
  | 'overflowX'
  | 'overflowY'
  | 'direction'
  | 'position'
  | 'scrollPaddingTop'
  | 'scrollPaddingRight'
  | 'scrollPaddingBottom'
  | 'scrollPaddingLeft'
  | 'scrollMarginTop'
  | 'scrollMarginRight'
  | 'scrollMarginBottom'
  | 'scrollMarginLeft'
>;

type ElementLayout = Pick<
  HTMLElement,
  | 'clientWidth'
  | 'clientHeight'
  | 'scrollWidth'
  | 'scrollHeight'
  | 'scrollTop'
  | 'scrollLeft'
  | 'offsetWidth'
  | 'offsetHeight'
>;

const DEFAULT_COMPUTED_STYLE: ScrollComputedStyle = {
  overflowX: 'visible',
  overflowY: 'visible',
  direction: 'ltr',
  position: 'static',
  scrollPaddingTop: 'auto',
  scrollPaddingRight: 'auto',
  scrollPaddingBottom: 'auto',
  scrollPaddingLeft: 'auto',
  scrollMarginTop: '0px',
  scrollMarginRight: '0px',
  scrollMarginBottom: '0px',
  scrollMarginLeft: '0px',
};

const VERTICALLY_SCROLLABLE_STYLE: Partial<ScrollComputedStyle> = {
  overflowY: 'auto',
};

const VERTICALLY_SCROLLABLE_LAYOUT: Partial<ElementLayout> = {
  clientWidth: 100,
  clientHeight: 100,
  scrollWidth: 100,
  scrollHeight: 500,
};

const createRectList = (rects: DOMRect[]): DOMRectList =>
  Object.assign([...rects], {
    item: (index: number) => rects[index] ?? null,
  });

const stubElementGeometry = ({
  element,
  rect,
  layout = {},
}: {
  element: HTMLElement;
  rect: DOMRect;
  layout?: Partial<ElementLayout>;
}) => {
  element.getBoundingClientRect = () => rect;
  element.getClientRects = () => createRectList([rect]);

  for (const [propertyName, value] of Object.entries(layout)) {
    Object.defineProperty(element, propertyName, { value });
  }
};

const stubScrollTo = (element: HTMLElement) => {
  const scrollTo = jest.fn();

  element.scrollTo = scrollTo;

  return scrollTo;
};

const stubComputedStyles = (
  computedStylesByElement: Map<Element, Partial<ScrollComputedStyle>>,
) => {
  const readComputedStyle = window.getComputedStyle.bind(window);

  return jest
    .spyOn(window, 'getComputedStyle')
    .mockImplementation((element) => {
      const computedStyle = readComputedStyle(element);
      const stubbedStyle = {
        ...DEFAULT_COMPUTED_STYLE,
        ...computedStylesByElement.get(element),
      };

      for (const [propertyName, value] of Object.entries(stubbedStyle)) {
        Object.defineProperty(computedStyle, propertyName, { value });
      }

      return computedStyle;
    });
};

const createNestedElements = () => {
  const root = document.createElement('div');
  const outer = document.createElement('div');
  const inner = document.createElement('div');
  const target = document.createElement('div');

  root.append(outer);
  outer.append(inner);
  inner.append(target);

  return {
    root,
    outer,
    inner,
    target,
    rootScrollTo: stubScrollTo(root),
    outerScrollTo: stubScrollTo(outer),
    innerScrollTo: stubScrollTo(inner),
  };
};

const isAnyNodeOwned = () => true;

describe('scrollOwnedAncestorsIntoView', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return no scroll container and scroll nothing when the target has no client rects', () => {
    const { outer, inner, target, outerScrollTo, innerScrollTo } =
      createNestedElements();

    stubElementGeometry({
      element: outer,
      rect: new DOMRect(0, 0, 100, 100),
      layout: VERTICALLY_SCROLLABLE_LAYOUT,
    });
    stubElementGeometry({
      element: inner,
      rect: new DOMRect(0, 0, 100, 100),
      layout: VERTICALLY_SCROLLABLE_LAYOUT,
    });
    target.getBoundingClientRect = () => new DOMRect(0, 300, 100, 20);
    target.getClientRects = () => createRectList([]);
    const getComputedStyleSpy = stubComputedStyles(
      new Map([
        [outer, VERTICALLY_SCROLLABLE_STYLE],
        [inner, VERTICALLY_SCROLLABLE_STYLE],
      ]),
    );

    expect(
      scrollOwnedAncestorsIntoView({
        target,
        block: 'nearest',
        inline: 'nearest',
        isOwnedNode: isAnyNodeOwned,
      }),
    ).toEqual([]);
    expect(innerScrollTo).not.toHaveBeenCalled();
    expect(outerScrollTo).not.toHaveBeenCalled();
    expect(getComputedStyleSpy).not.toHaveBeenCalled();
  });

  it('should scroll the innermost owned scroll container first and return every scroll container walked', () => {
    const { outer, inner, target, outerScrollTo, innerScrollTo } =
      createNestedElements();

    stubElementGeometry({
      element: outer,
      rect: new DOMRect(0, 0, 100, 100),
      layout: { ...VERTICALLY_SCROLLABLE_LAYOUT, scrollTop: 40 },
    });
    stubElementGeometry({
      element: inner,
      rect: new DOMRect(0, 50, 100, 100),
      layout: { ...VERTICALLY_SCROLLABLE_LAYOUT, scrollTop: 10 },
    });
    stubElementGeometry({
      element: target,
      rect: new DOMRect(0, 300, 100, 20),
    });
    stubComputedStyles(
      new Map([
        [outer, VERTICALLY_SCROLLABLE_STYLE],
        [inner, VERTICALLY_SCROLLABLE_STYLE],
      ]),
    );

    const scrollContainers = scrollOwnedAncestorsIntoView({
      target,
      block: 'start',
      inline: 'nearest',
      isOwnedNode: isAnyNodeOwned,
    });

    expect(scrollContainers).toEqual([inner, outer]);
    expect(innerScrollTo).toHaveBeenCalledTimes(1);
    expect(innerScrollTo).toHaveBeenCalledWith({
      top: 260,
      left: 0,
      behavior: 'instant',
    });
    expect(outerScrollTo).toHaveBeenCalledTimes(1);
    expect(outerScrollTo).toHaveBeenCalledWith({
      top: 340,
      left: 0,
      behavior: 'instant',
    });
    expect(innerScrollTo.mock.invocationCallOrder[0]).toBeLessThan(
      outerScrollTo.mock.invocationCallOrder[0],
    );
  });

  it('should not scroll any ancestor of a fixed-position target', () => {
    const { inner, target, innerScrollTo } = createNestedElements();

    stubElementGeometry({
      element: inner,
      rect: new DOMRect(0, 0, 100, 100),
      layout: VERTICALLY_SCROLLABLE_LAYOUT,
    });
    stubElementGeometry({
      element: target,
      rect: new DOMRect(0, 300, 100, 20),
    });
    stubComputedStyles(
      new Map<Element, Partial<ScrollComputedStyle>>([
        [inner, VERTICALLY_SCROLLABLE_STYLE],
        [target, { position: 'fixed' }],
      ]),
    );

    expect(
      scrollOwnedAncestorsIntoView({
        target,
        block: 'start',
        inline: 'nearest',
        isOwnedNode: isAnyNodeOwned,
      }),
    ).toEqual([]);
    expect(innerScrollTo).not.toHaveBeenCalled();
  });

  it('should scroll a fixed-position scroll container and stop walking above it', () => {
    const { outer, inner, target, outerScrollTo, innerScrollTo } =
      createNestedElements();

    stubElementGeometry({
      element: outer,
      rect: new DOMRect(0, 0, 100, 100),
      layout: { ...VERTICALLY_SCROLLABLE_LAYOUT, scrollTop: 40 },
    });
    stubElementGeometry({
      element: inner,
      rect: new DOMRect(0, 50, 100, 100),
      layout: { ...VERTICALLY_SCROLLABLE_LAYOUT, scrollTop: 10 },
    });
    stubElementGeometry({
      element: target,
      rect: new DOMRect(0, 300, 100, 20),
    });
    stubComputedStyles(
      new Map<Element, Partial<ScrollComputedStyle>>([
        [outer, VERTICALLY_SCROLLABLE_STYLE],
        [inner, { ...VERTICALLY_SCROLLABLE_STYLE, position: 'fixed' }],
      ]),
    );

    expect(
      scrollOwnedAncestorsIntoView({
        target,
        block: 'start',
        inline: 'nearest',
        isOwnedNode: isAnyNodeOwned,
      }),
    ).toEqual([inner]);
    expect(innerScrollTo).toHaveBeenCalledWith({
      top: 260,
      left: 0,
      behavior: 'instant',
    });
    expect(outerScrollTo).not.toHaveBeenCalled();
  });

  it('should return a scroll container without scrolling it when the target is already visible in it', () => {
    const { inner, target, innerScrollTo } = createNestedElements();

    stubElementGeometry({
      element: inner,
      rect: new DOMRect(0, 0, 100, 100),
      layout: VERTICALLY_SCROLLABLE_LAYOUT,
    });
    stubElementGeometry({
      element: target,
      rect: new DOMRect(0, 40, 100, 20),
    });
    stubComputedStyles(new Map([[inner, VERTICALLY_SCROLLABLE_STYLE]]));

    expect(
      scrollOwnedAncestorsIntoView({
        target,
        block: 'nearest',
        inline: 'nearest',
        isOwnedNode: isAnyNodeOwned,
      }),
    ).toEqual([inner]);
    expect(innerScrollTo).not.toHaveBeenCalled();
  });

  it('should skip ancestors that are not scroll containers without scrolling them', () => {
    const { outer, inner, target, outerScrollTo, innerScrollTo } =
      createNestedElements();

    stubElementGeometry({
      element: outer,
      rect: new DOMRect(0, 0, 100, 100),
      layout: VERTICALLY_SCROLLABLE_LAYOUT,
    });
    stubElementGeometry({
      element: inner,
      rect: new DOMRect(0, 0, 100, 100),
      layout: VERTICALLY_SCROLLABLE_LAYOUT,
    });
    stubElementGeometry({
      element: target,
      rect: new DOMRect(0, 300, 100, 20),
    });
    stubComputedStyles(
      new Map<Element, Partial<ScrollComputedStyle>>([
        [outer, VERTICALLY_SCROLLABLE_STYLE],
        [inner, { overflowX: 'visible', overflowY: 'visible' }],
      ]),
    );

    const scrollContainers = scrollOwnedAncestorsIntoView({
      target,
      block: 'nearest',
      inline: 'nearest',
      isOwnedNode: isAnyNodeOwned,
    });

    expect(scrollContainers).toEqual([outer]);
    expect(innerScrollTo).not.toHaveBeenCalled();
    expect(outerScrollTo).toHaveBeenCalledWith({
      top: 220,
      left: 0,
      behavior: 'instant',
    });
  });

  it('should skip an ancestor with scrollable overflow whose content fits', () => {
    const { outer, inner, target, outerScrollTo, innerScrollTo } =
      createNestedElements();

    stubElementGeometry({
      element: outer,
      rect: new DOMRect(0, 0, 100, 100),
      layout: VERTICALLY_SCROLLABLE_LAYOUT,
    });
    stubElementGeometry({
      element: inner,
      rect: new DOMRect(0, 0, 100, 100),
      layout: {
        clientWidth: 100,
        clientHeight: 100,
        scrollWidth: 100,
        scrollHeight: 100,
      },
    });
    stubElementGeometry({
      element: target,
      rect: new DOMRect(0, 300, 100, 20),
    });
    stubComputedStyles(
      new Map([
        [outer, VERTICALLY_SCROLLABLE_STYLE],
        [inner, VERTICALLY_SCROLLABLE_STYLE],
      ]),
    );

    expect(
      scrollOwnedAncestorsIntoView({
        target,
        block: 'nearest',
        inline: 'nearest',
        isOwnedNode: isAnyNodeOwned,
      }),
    ).toEqual([outer]);
    expect(innerScrollTo).not.toHaveBeenCalled();
    expect(outerScrollTo).toHaveBeenCalledTimes(1);
  });

  it('should stop at the first ancestor rejected by isOwnedNode without touching it or anything above it', () => {
    const {
      root,
      outer,
      inner,
      target,
      rootScrollTo,
      outerScrollTo,
      innerScrollTo,
    } = createNestedElements();

    for (const scrollContainer of [root, outer, inner]) {
      stubElementGeometry({
        element: scrollContainer,
        rect: new DOMRect(0, 0, 100, 100),
        layout: VERTICALLY_SCROLLABLE_LAYOUT,
      });
    }
    stubElementGeometry({
      element: target,
      rect: new DOMRect(0, 300, 100, 20),
    });
    const getComputedStyleSpy = stubComputedStyles(
      new Map([
        [root, VERTICALLY_SCROLLABLE_STYLE],
        [outer, VERTICALLY_SCROLLABLE_STYLE],
        [inner, VERTICALLY_SCROLLABLE_STYLE],
      ]),
    );
    const isOwnedNode = jest.fn((node: Element) => node !== outer);

    const scrollContainers = scrollOwnedAncestorsIntoView({
      target,
      block: 'nearest',
      inline: 'nearest',
      isOwnedNode,
    });

    expect(scrollContainers).toEqual([inner]);
    expect(innerScrollTo).toHaveBeenCalledTimes(1);
    expect(outerScrollTo).not.toHaveBeenCalled();
    expect(rootScrollTo).not.toHaveBeenCalled();
    expect(isOwnedNode).not.toHaveBeenCalledWith(root);
    expect(getComputedStyleSpy).not.toHaveBeenCalledWith(outer);
    expect(getComputedStyleSpy).not.toHaveBeenCalledWith(root);
  });

  it('should scroll a right to left container to a negative scroll left for nearest inline alignment', () => {
    const { inner, target, innerScrollTo } = createNestedElements();

    stubElementGeometry({
      element: inner,
      rect: new DOMRect(100, 0, 100, 100),
      layout: {
        clientWidth: 100,
        clientHeight: 100,
        scrollWidth: 300,
        scrollHeight: 100,
        scrollLeft: 0,
      },
    });
    stubElementGeometry({
      element: target,
      rect: new DOMRect(40, 40, 20, 20),
    });
    stubComputedStyles(
      new Map<Element, Partial<ScrollComputedStyle>>([
        [inner, { overflowX: 'auto', direction: 'rtl' }],
      ]),
    );

    expect(
      scrollOwnedAncestorsIntoView({
        target,
        block: 'nearest',
        inline: 'nearest',
        isOwnedNode: isAnyNodeOwned,
      }),
    ).toEqual([inner]);
    expect(innerScrollTo).toHaveBeenCalledWith({
      top: 0,
      left: -60,
      behavior: 'instant',
    });
  });

  it('should divide the scroll delta by the scroll container scale', () => {
    const { inner, target, innerScrollTo } = createNestedElements();

    stubElementGeometry({
      element: inner,
      rect: new DOMRect(0, 0, 200, 100),
      layout: {
        clientWidth: 100,
        clientHeight: 50,
        scrollWidth: 400,
        scrollHeight: 500,
        scrollTop: 10,
        scrollLeft: 5,
        offsetWidth: 100,
        offsetHeight: 50,
      },
    });
    stubElementGeometry({
      element: target,
      rect: new DOMRect(300, 300, 20, 20),
    });
    stubComputedStyles(
      new Map<Element, Partial<ScrollComputedStyle>>([
        [inner, { overflowX: 'auto', overflowY: 'auto' }],
      ]),
    );

    scrollOwnedAncestorsIntoView({
      target,
      block: 'start',
      inline: 'start',
      isOwnedNode: isAnyNodeOwned,
    });

    expect(innerScrollTo).toHaveBeenCalledWith({
      top: 160,
      left: 155,
      behavior: 'instant',
    });
  });

  it('should honour the container scroll padding and the target scroll margin', () => {
    const { inner, target, innerScrollTo } = createNestedElements();

    stubElementGeometry({
      element: inner,
      rect: new DOMRect(0, 0, 100, 100),
      layout: VERTICALLY_SCROLLABLE_LAYOUT,
    });
    stubElementGeometry({
      element: target,
      rect: new DOMRect(0, 300, 100, 20),
    });
    stubComputedStyles(
      new Map<Element, Partial<ScrollComputedStyle>>([
        [inner, { overflowY: 'auto', scrollPaddingTop: '10px' }],
        [target, { scrollMarginTop: '5px' }],
      ]),
    );

    scrollOwnedAncestorsIntoView({
      target,
      block: 'start',
      inline: 'nearest',
      isOwnedNode: isAnyNodeOwned,
    });

    expect(innerScrollTo).toHaveBeenCalledWith({
      top: 285,
      left: 0,
      behavior: 'instant',
    });
  });
});
