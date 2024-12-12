import { isDefined } from '~/utils/isDefined';

export const mergeRefs = <T>(...refs: (React.Ref<T> | undefined)[]) => {
  return (node: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (isDefined(ref) && 'current' in ref) {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    });
  };
};
