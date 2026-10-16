import { type UserRef } from '@/front-component-renderer/build/jsx-runtime/types/user-ref.type';

export type ElementProps = {
  [propName: string]: unknown;
  ref?: UserRef;
  children?: unknown;
  dangerouslySetInnerHTML?: { __html?: string };
};
