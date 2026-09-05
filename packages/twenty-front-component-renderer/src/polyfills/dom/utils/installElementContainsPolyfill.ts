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
  elementPrototype: object,
): void => {
  // Typed loosely on purpose: the caller hands over the runtime's own
  // Element.prototype, whose class type is not assignable to an index
  // signature under this package's strict settings.
  (elementPrototype as { contains?: (other: unknown) => boolean }).contains =
    function contains(this: NodeLike, other: unknown): boolean {
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
