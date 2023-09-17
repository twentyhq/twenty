import React, { Ref, RefCallback } from 'react';

export const useCombinedRefs =
  <T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> =>
  (node: T) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref !== null && ref !== undefined) {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  };
