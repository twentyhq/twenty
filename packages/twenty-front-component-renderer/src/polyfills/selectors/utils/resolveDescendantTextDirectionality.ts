import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { NODE_TYPE_BY_NAME } from '@/polyfills/dom/constants/NodeTypeByName';
import { type Directionality } from '@/polyfills/selectors/types/Directionality';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { collectChildNodes } from '@/polyfills/selectors/utils/collectChildNodes';
import { doesElementContributeToParentDirectionality } from '@/polyfills/selectors/utils/doesElementContributeToParentDirectionality';
import { resolveTextDirectionality } from '@/polyfills/selectors/utils/resolveTextDirectionality';

export const resolveDescendantTextDirectionality = (
  element: SelectorElementLike,
): Directionality | null => {
  for (const childNode of collectChildNodes(element)) {
    if (
      childNode.nodeType !== NODE_TYPE_BY_NAME.TEXT &&
      !doesElementContributeToParentDirectionality(childNode)
    ) {
      continue;
    }

    const directionality =
      childNode.nodeType === NODE_TYPE_BY_NAME.TEXT
        ? resolveTextDirectionality(
            isString(childNode.textContent) ? childNode.textContent : '',
          )
        : resolveDescendantTextDirectionality(childNode);

    if (isDefined(directionality)) {
      return directionality;
    }
  }

  return null;
};
