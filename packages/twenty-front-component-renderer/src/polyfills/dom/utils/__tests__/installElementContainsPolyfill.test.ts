import { installElementContainsPolyfill } from '../installElementContainsPolyfill';

type FakeNode = {
  parentNode: FakeNode | null;
  contains?: (other: unknown) => boolean;
};

const createElement = (): FakeNode => ({
  parentNode: null,
});

const createBrokenRemoteDomContains = (): ((
  this: FakeNode,
  other: unknown,
) => boolean) =>
  // The exact @remote-dom/polyfill implementation this polyfill replaces:
  // it re-reads the ORIGINAL node's parentNode on every iteration, so any
  // indirect descendant loops forever.
  function brokenContains(this: FakeNode, other) {
    const node = other as FakeNode;
    let currentNode: FakeNode | null = node;

    for (;;) {
      if (currentNode == null) return false;
      if (currentNode === this) return true;
      currentNode = node.parentNode;
    }
  };

const createPrototypeWithInstalledContains = (
  original?: (this: FakeNode, other: unknown) => boolean,
) => {
  const prototype: FakeNode = {
    parentNode: null,
    ...(original ? { contains: original } : {}),
  };

  installElementContainsPolyfill(prototype);

  return prototype;
};

describe('installElementContainsPolyfill', () => {
  it('should return true for a direct child', () => {
    const prototype = createPrototypeWithInstalledContains();
    const parent = Object.create(prototype);
    const child = createElement();
    child.parentNode = parent;

    expect(parent.contains(child)).toBe(true);
  });

  it('should return true for an indirect descendant instead of hanging', () => {
    const prototype = createPrototypeWithInstalledContains();
    const ancestor = Object.create(prototype);
    const middle = createElement();
    middle.parentNode = ancestor;
    const descendant = createElement();
    descendant.parentNode = middle;

    // With @remote-dom/polyfill's implementation this call never returns:
    // middle is re-read forever (#24573).
    expect(ancestor.contains(descendant)).toBe(true);
  });

  it('should return true for the element itself', () => {
    const prototype = createPrototypeWithInstalledContains();
    const element = Object.create(prototype);

    expect(element.contains(element)).toBe(true);
  });

  it('should return false for a detached node', () => {
    const prototype = createPrototypeWithInstalledContains();
    const element = Object.create(prototype);
    const detached = createElement();

    expect(element.contains(detached)).toBe(false);
  });

  it('should return false for sibling subtrees', () => {
    const prototype = createPrototypeWithInstalledContains();
    const root = Object.create(prototype);
    const left = Object.create(prototype);
    left.parentNode = root;
    const right = createElement();
    right.parentNode = root;
    const rightChild = createElement();
    rightChild.parentNode = right;

    expect(left.contains(rightChild)).toBe(false);
  });

  it('should return false for nullish and non-node arguments', () => {
    const prototype = createPrototypeWithInstalledContains();
    const element = Object.create(prototype);

    expect(element.contains(null)).toBe(false);
    expect(element.contains(undefined)).toBe(false);
    expect(element.contains({})).toBe(false);
  });

  it('should replace the broken @remote-dom/polyfill implementation', () => {
    const broken = jest.fn(createBrokenRemoteDomContains());
    const prototype = createPrototypeWithInstalledContains(broken);
    const ancestor = Object.create(prototype);
    const middle = createElement();
    middle.parentNode = ancestor;
    const descendant = createElement();
    descendant.parentNode = middle;

    expect(ancestor.contains(descendant)).toBe(true);
    expect(broken).not.toHaveBeenCalled();
  });
});
