import { type ElementLike } from '@/polyfills/dom/types/ElementLike';

export type ElementWithClassAttribute = ElementLike & {
  className?: unknown;
};
