import { type UserRef } from '@/app/bundles/front-component-build/jsx-runtime/types/user-ref.type';

export type ElementProps = {
  [propName: string]: unknown;
  ref?: UserRef;
  children?: unknown;
  dangerouslySetInnerHTML?: { __html?: string };
};
