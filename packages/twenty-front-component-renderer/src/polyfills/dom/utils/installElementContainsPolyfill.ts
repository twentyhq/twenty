type NodeLike = {
  parentNode: unknown;
};

/**
 * Installs a spec-compliant `contains()` on the remote worker's element
 * prototype, replacing the @remote-dom/polyfill implementation whose walk
 * never advances past the argument's own parentNode: direct children
 * happen to return, but any indirect descendant hangs the worker forever
 * (#24573).
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
