import React, { Ref, RefCallback } from 'react';

export function useCombinedRefs<T>(
  ...refs: (Ref<T> | undefined)[]
): RefCallback<T> {
  return (node: T) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref !== null && ref !== undefined) {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  };
}
