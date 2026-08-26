import { installNodeContains } from '../installNodeContains';

class FakeNode {
  parentNode: FakeNode | null = null;

  appendChild(child: FakeNode): FakeNode {
    child.parentNode = this;

    return child;
  }
}

installNodeContains(FakeNode.prototype);

type NodeWithContains = FakeNode & {
  contains: (otherNode: unknown) => boolean;
};

const asInstalled = (node: FakeNode) => node as NodeWithContains;

describe('installNodeContains', () => {
  it('should report a node as containing itself', () => {
    const node = new FakeNode();

    expect(asInstalled(node).contains(node)).toBe(true);
  });

  it('should report a direct child as contained', () => {
    const parent = new FakeNode();
    const child = parent.appendChild(new FakeNode());

    expect(asInstalled(parent).contains(child)).toBe(true);
  });

  it('should report a deep descendant as contained', () => {
    const root = new FakeNode();
    const intermediate = root.appendChild(new FakeNode());
    const leaf = intermediate.appendChild(new FakeNode());

    expect(asInstalled(root).contains(leaf)).toBe(true);
  });

  it('should not report an ancestor as contained by its descendant', () => {
    const root = new FakeNode();
    const child = root.appendChild(new FakeNode());

    expect(asInstalled(child).contains(root)).toBe(false);
  });

  it('should not report a node from a detached tree as contained', () => {
    const root = new FakeNode();
    root.appendChild(new FakeNode());

    const otherRoot = new FakeNode();
    const otherLeaf = otherRoot.appendChild(new FakeNode());

    expect(asInstalled(root).contains(otherLeaf)).toBe(false);
  });

  it('should return false for a nullish argument', () => {
    const node = new FakeNode();

    expect(asInstalled(node).contains(null)).toBe(false);
    expect(asInstalled(node).contains(undefined)).toBe(false);
  });

  it('should read each ancestor once instead of re-reading the argument', () => {
    const root = new FakeNode();
    const intermediate = root.appendChild(new FakeNode());
    const leaf = intermediate.appendChild(new FakeNode());
    const ancestorChain = [leaf, intermediate, root];

    // A cursor that never advances re-reads the same parentNode forever, which
    // hangs rather than fails; the read budget turns that into an assertion.
    let parentNodeReads = 0;

    for (const node of ancestorChain) {
      const resolvedParentNode = node.parentNode;

      Object.defineProperty(node, 'parentNode', {
        get: () => {
          parentNodeReads += 1;

          if (parentNodeReads > ancestorChain.length) {
            throw new Error('contains() did not advance past the argument');
          }

          return resolvedParentNode;
        },
      });
    }

    expect(asInstalled(new FakeNode()).contains(leaf)).toBe(false);
    expect(parentNodeReads).toBe(ancestorChain.length);
  });
});
