import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';
import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';

export const doesCloneReplaceElementRef = (
  cloneConfig: ElementProps,
  elementRef: UserRef,
) => {
  const cloneSetsRef = cloneConfig.ref !== undefined;
  const cloneRefDiffersFromElementRef = cloneConfig.ref !== elementRef;
  return cloneSetsRef && cloneRefDiffersFromElementRef;
};
