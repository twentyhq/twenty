type NodeLike = {
  parentNode: unknown;
};

/**
 * Installs a spec-compliant `contains()` on the remote worker's element
 * prototype.
 *
 * `@remote-dom/polyfill`'s `Node#contains` never advances the walk: it
 * re-reads the ORIGINAL node's `parentNode` on every iteration
 * (`currentNode = node.parentNode` instead of `currentNode.parentNode`), so
 * for any element that is not a DIRECT child the loop never terminates —
 * and because the worker's DOM is synchronous, that call hangs the worker's
 * whole event loop with no exception and no way to recover except a reload
 * (#24573). Direct children returned correctly, which is why the bug looked
 * like a random freeze that only repro'd on deeper trees.
 *
 * The replacement walks `parentNode` from the argument up to the root, the
 * `Node.prototype.contains` contract: `true` when the receiver is on that
 * chain, `false` for a detached node, a non-node argument, or `null`.
 */
export const installElementContainsPolyfill = (
  elementPrototype: NodeLike & Record<string, unknown>,
): void => {
  elementPrototype.contains = function contains(other: unknown): boolean {
    let currentNode: unknown = other;

    while (currentNode != null) {
      if (currentNode === this) {
        return true;
      }
      currentNode = (currentNode as NodeLike).parentNode;
    }

    return false;
  };
};
