import { type ElementProps } from '@/front-component-renderer/build/jsx-runtime/types/element-props.type';
import { type UserRef } from '@/front-component-renderer/build/jsx-runtime/types/user-ref.type';

export const doesCloneReplaceElementRef = (
  cloneConfig: ElementProps,
  elementRef: UserRef,
) => {
  const cloneSetsRef = cloneConfig.ref !== undefined;
  const cloneRefDiffersFromElementRef = cloneConfig.ref !== elementRef;
  return cloneSetsRef && cloneRefDiffersFromElementRef;
};
