import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';
import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';

export const doesCloneConfigReplaceElementRef = (
  config: ElementProps | null | undefined,
  elementRef: UserRef,
) => config != null && config.ref !== undefined && config.ref !== elementRef;
