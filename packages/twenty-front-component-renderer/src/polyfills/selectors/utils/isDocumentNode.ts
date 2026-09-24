import { isObject } from '@sniptt/guards';

import { NODE_TYPE_BY_NAME } from '@/polyfills/dom/constants/NodeTypeByName';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export const isDocumentNode = (node: unknown): node is SelectorElementLike =>
  isObject(node) &&
  (node as SelectorElementLike).nodeType === NODE_TYPE_BY_NAME.DOCUMENT;
