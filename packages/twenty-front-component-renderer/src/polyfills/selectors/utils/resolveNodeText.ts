import { isString } from '@sniptt/guards';

import { NODE_TYPE_BY_NAME } from '@/polyfills/dom/constants/NodeTypeByName';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export const resolveNodeText = (node: SelectorElementLike): string =>
  node.nodeType !== NODE_TYPE_BY_NAME.COMMENT && isString(node.textContent)
    ? node.textContent
    : '';
