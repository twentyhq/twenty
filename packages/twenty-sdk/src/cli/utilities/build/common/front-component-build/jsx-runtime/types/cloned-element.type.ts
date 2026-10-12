import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';
import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';

export type ClonedElement = {
  type: unknown;
  props: ElementProps;
  ref?: UserRef;
};
