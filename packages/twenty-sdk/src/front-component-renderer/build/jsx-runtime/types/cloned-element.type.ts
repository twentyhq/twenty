import { type ElementProps } from '@/front-component-renderer/build/jsx-runtime/types/element-props.type';
import { type UserRef } from '@/front-component-renderer/build/jsx-runtime/types/user-ref.type';

export type ClonedElement = {
  type: unknown;
  props: ElementProps;
  ref?: UserRef;
};
