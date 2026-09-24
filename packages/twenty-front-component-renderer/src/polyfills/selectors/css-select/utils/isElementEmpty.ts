import { isNonEmptyString } from '@sniptt/guards';

import { NODE_TYPE_BY_NAME } from '@/polyfills/dom/constants/NodeTypeByName';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { collectChildNodes } from '@/polyfills/selectors/utils/collectChildNodes';

const isContentNode = ({
  nodeType,
  textContent,
}: SelectorElementLike): boolean =>
  nodeType === NODE_TYPE_BY_NAME.ELEMENT ||
  (nodeType !== NODE_TYPE_BY_NAME.COMMENT && isNonEmptyString(textContent));

export const isElementEmpty = (element: SelectorElementLike): boolean =>
  !collectChildNodes(element).some(isContentNode);
