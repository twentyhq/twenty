import { applyScrollRequest } from '@/host/scroll/utils/applyScrollRequest';
import { scrollOwnedAncestorsIntoView } from '@/host/scroll/utils/scrollOwnedAncestorsIntoView';
import { type ScrollRequest } from '@/types/ScrollRequest';

jest.mock('@/host/scroll/utils/scrollOwnedAncestorsIntoView', () => ({
  scrollOwnedAncestorsIntoView: jest.fn(),
}));

const scrollOwnedAncestorsIntoViewMock = jest.mocked(
  scrollOwnedAncestorsIntoView,
);

const createNodeWithScrollTo = () => {
  const node = document.createElement('div');
  const scrollTo = jest.fn();

  Object.defineProperty(node, 'scrollTo', {
    value: scrollTo,
    configurable: true,
  });

  return { node, scrollTo };
};

describe('applyScrollRequest', () => {
  beforeEach(() => {
    scrollOwnedAncestorsIntoViewMock.mockReset();
  });

  it('should scroll the node instantly to both axes and return it', () => {
    const { node, scrollTo } = createNodeWithScrollTo();

    const scrolledNodes = applyScrollRequest({
      node,
      request: { method: 'scrollTo', top: 40, left: 12 },
      isOwnedNode: jest.fn(),
    });

    expect(scrollTo.mock.calls).toStrictEqual([
      [{ top: 40, left: 12, behavior: 'instant' }],
    ]);
    expect(scrolledNodes).toHaveLength(1);
    expect(scrolledNodes[0]).toBe(node);
    expect(scrollOwnedAncestorsIntoViewMock).not.toHaveBeenCalled();
  });

  it.each<{
    request: ScrollRequest;
    expectedScrollToOptions: ScrollToOptions;
  }>([
    {
      request: { method: 'scrollTo', top: 40 },
      expectedScrollToOptions: { top: 40, behavior: 'instant' },
    },
    {
      request: { method: 'scrollTo', left: 0 },
      expectedScrollToOptions: { left: 0, behavior: 'instant' },
    },
  ])(
    'should pass only the defined axes of the request $request to scrollTo',
    ({ request, expectedScrollToOptions }) => {
      const { node, scrollTo } = createNodeWithScrollTo();

      applyScrollRequest({ node, request, isOwnedNode: jest.fn() });

      expect(scrollTo.mock.calls).toStrictEqual([[expectedScrollToOptions]]);
    },
  );

  it('should delegate a scrollIntoView request to the owned ancestors walk and return its scrolled containers', () => {
    const { node, scrollTo } = createNodeWithScrollTo();
    const scrolledAncestors = [document.createElement('div')];
    const isOwnedNode = jest.fn();

    scrollOwnedAncestorsIntoViewMock.mockReturnValue(scrolledAncestors);

    const scrolledNodes = applyScrollRequest({
      node,
      request: { method: 'scrollIntoView', block: 'center', inline: 'end' },
      isOwnedNode,
    });

    expect(scrolledNodes).toBe(scrolledAncestors);
    expect(scrollOwnedAncestorsIntoViewMock).toHaveBeenCalledTimes(1);
    expect(scrollOwnedAncestorsIntoViewMock).toHaveBeenCalledWith({
      target: node,
      block: 'center',
      inline: 'end',
      isOwnedNode,
    });
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
