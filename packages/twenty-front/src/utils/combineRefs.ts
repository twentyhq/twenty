import { isFunction } from '@sniptt/guards';
import { type MutableRefObject, type Ref } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const combineRefs = <T>(...refs: (Ref<T> | undefined)[]) => {
  return (node: T) => {
    for (const ref of refs) {
      if (isFunction(ref)) {
        ref(node);
      } else if (isDefined(ref) && 'current' in ref) {
        (ref as MutableRefObject<T | null>).current = node;
      }
    }
  };
};
