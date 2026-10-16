import { type ElementProps } from '@/app/bundles/front-component-build/jsx-runtime/types/element-props.type';
import { type UserRef } from '@/app/bundles/front-component-build/jsx-runtime/types/user-ref.type';

export const doesCloneReplaceElementRef = (
  cloneConfig: ElementProps,
  elementRef: UserRef,
) => {
  const cloneSetsRef = cloneConfig.ref !== undefined;
  const cloneRefDiffersFromElementRef = cloneConfig.ref !== elementRef;
  return cloneSetsRef && cloneRefDiffersFromElementRef;
};
