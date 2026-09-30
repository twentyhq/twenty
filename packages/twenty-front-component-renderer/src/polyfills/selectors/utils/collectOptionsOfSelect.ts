import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { collectChildNodes } from '@/polyfills/selectors/utils/collectChildNodes';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';

export const collectOptionsOfSelect = (
  select: SelectorElementLike,
): SelectorElementLike[] =>
  collectChildNodes(select).flatMap((childNode) => {
    if (resolveHtmlTagNameOfElement(childNode) === 'option') {
      return [childNode];
    }

    return resolveHtmlTagNameOfElement(childNode) === 'optgroup'
      ? collectChildNodes(childNode).filter(
          (optgroupChildNode) =>
            resolveHtmlTagNameOfElement(optgroupChildNode) === 'option',
        )
      : [];
  });
