import { isAncestorOrSelfOfNode } from '../isAncestorOrSelfOfNode';

type FakeNode = {
  parentNode: FakeNode | null;
};

const createNode = (parentNode: FakeNode | null = null): FakeNode => ({
  parentNode,
});

describe('isAncestorOrSelfOfNode', () => {
  it('should return true for the node itself', () => {
    const node = createNode();

    expect(isAncestorOrSelfOfNode(node, node)).toBe(true);
  });

  it('should return true for an indirect ancestor', () => {
    const ancestor = createNode();
    const descendant = createNode(createNode(ancestor));

    expect(isAncestorOrSelfOfNode(ancestor, descendant)).toBe(true);
  });

  it('should return false for a descendant, a sibling subtree and non-nodes', () => {
    const root = createNode();
    const child = createNode(root);
    const sibling = createNode(root);

    expect(isAncestorOrSelfOfNode(child, root)).toBe(false);
    expect(isAncestorOrSelfOfNode(child, createNode(sibling))).toBe(false);
    expect(isAncestorOrSelfOfNode(root, null)).toBe(false);
    expect(isAncestorOrSelfOfNode(root, 'text')).toBe(false);
  });
});
