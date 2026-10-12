import { type ElementWithAttributes } from '@/polyfills/dom/types/ElementWithAttributes';

export type ElementWithAttributeNames = ElementWithAttributes & {
  getAttributeNames: () => string[];
};
