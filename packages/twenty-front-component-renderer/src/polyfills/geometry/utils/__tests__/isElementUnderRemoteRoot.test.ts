import { isElementUnderRemoteRoot } from '../isElementUnderRemoteRoot';

const createNode = (parentNode: object | null = null) => ({ parentNode });

describe('isElementUnderRemoteRoot', () => {
  it('should return false when there is no root', () => {
    expect(isElementUnderRemoteRoot(createNode(), null)).toBe(false);
  });

  it('should return true for the root itself', () => {
    const root = createNode();

    expect(isElementUnderRemoteRoot(root, root)).toBe(true);
  });

  it('should return true for a nested descendant', () => {
    const root = createNode();
    const parent = createNode(root);
    const child = createNode(parent);

    expect(isElementUnderRemoteRoot(child, root)).toBe(true);
  });

  it('should return false for a detached element', () => {
    const root = createNode();

    expect(isElementUnderRemoteRoot(createNode(), root)).toBe(false);
  });

  it('should return false for a sibling subtree outside the root', () => {
    const body = createNode();
    const root = createNode(body);
    const outsider = createNode(body);

    expect(isElementUnderRemoteRoot(outsider, root)).toBe(false);
  });

  it('should terminate on a parent node cycle', () => {
    const first: { parentNode: object | null } = { parentNode: null };
    const second = { parentNode: first };
    first.parentNode = second;

    expect(isElementUnderRemoteRoot(first, createNode())).toBe(false);
  });
});
