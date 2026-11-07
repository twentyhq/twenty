import { REMOTE_RENDER_CONTAINER_TAG } from '@/constants/RemoteRenderContainerTag';
import { isScrollCommandTarget } from '@/polyfills/scroll/utils/isScrollCommandTarget';

const createNode = ({
  parentNode = null,
  localName = 'div',
}: {
  parentNode?: object | null;
  localName?: string;
} = {}) => ({ parentNode, localName });

describe('isScrollCommandTarget', () => {
  it('should return true for an element under the root', () => {
    const rootElement = createNode();
    const list = createNode({ parentNode: rootElement });
    const item = createNode({ parentNode: list });

    expect(isScrollCommandTarget({ element: list, rootElement })).toBe(true);
    expect(isScrollCommandTarget({ element: item, rootElement })).toBe(true);
  });

  it('should return false for the root itself', () => {
    const rootElement = createNode();

    expect(isScrollCommandTarget({ element: rootElement, rootElement })).toBe(
      false,
    );
  });

  it('should return false for a remote render container under the root', () => {
    const rootElement = createNode();
    const renderContainer = createNode({
      parentNode: rootElement,
      localName: REMOTE_RENDER_CONTAINER_TAG,
    });

    expect(
      isScrollCommandTarget({ element: renderContainer, rootElement }),
    ).toBe(false);
  });

  it('should return false for a detached element', () => {
    const rootElement = createNode();
    const detachedParent = createNode();
    const detachedElement = createNode({ parentNode: detachedParent });

    expect(
      isScrollCommandTarget({ element: detachedElement, rootElement }),
    ).toBe(false);
  });

  it('should return false when there is no root', () => {
    const element = createNode({ parentNode: createNode() });

    expect(isScrollCommandTarget({ element, rootElement: null })).toBe(false);
  });
});
