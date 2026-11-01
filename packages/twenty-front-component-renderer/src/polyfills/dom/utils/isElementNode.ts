import { isObject } from '@sniptt/guards';

import { NODE_TYPE_BY_NAME } from '@/polyfills/dom/constants/NodeTypeByName';

export const isElementNode = (node: unknown): node is Element =>
  isObject(node) && Reflect.get(node, 'nodeType') === NODE_TYPE_BY_NAME.ELEMENT;
