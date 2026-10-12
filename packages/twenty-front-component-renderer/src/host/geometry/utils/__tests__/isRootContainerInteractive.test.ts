import { isRootContainerInteractive } from '../isRootContainerInteractive';

const createRootContainer = ({ isRendered }: { isRendered: boolean }) => {
  const rootContainer = document.createElement('div');
  document.body.append(rootContainer);

  rootContainer.getClientRects = () =>
    (isRendered
      ? [rootContainer.getBoundingClientRect()]
      : []) as unknown as DOMRectList;

  return rootContainer;
};

describe('isRootContainerInteractive', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should be false without a root container', () => {
    expect(isRootContainerInteractive(null)).toBe(false);
  });

  it('should be false when the root container is not rendered', () => {
    expect(
      isRootContainerInteractive(createRootContainer({ isRendered: false })),
    ).toBe(false);
  });

  it('should be false when the root container ignores pointer events', () => {
    const rootContainer = createRootContainer({ isRendered: true });
    rootContainer.style.pointerEvents = 'none';

    expect(isRootContainerInteractive(rootContainer)).toBe(false);
  });

  it('should be true when the root container is rendered and receives pointer events', () => {
    expect(
      isRootContainerInteractive(createRootContainer({ isRendered: true })),
    ).toBe(true);
  });
});
