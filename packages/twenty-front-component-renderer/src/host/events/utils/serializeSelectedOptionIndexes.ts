import { collectOptionsOfSelect } from '@/polyfills/selectors/utils/collectOptionsOfSelect';
import { hasElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/hasElementAttributeIgnoringCase';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';

export const serializeSelectedOptionIndexes = (
  element: unknown,
): number[] | undefined => {
  if (
    !isSelectorElementNode(element) ||
    resolveHtmlTagNameOfElement(element) !== 'select' ||
    !hasElementAttributeIgnoringCase(element, 'multiple')
  ) {
    return undefined;
  }

  return collectOptionsOfSelect(element).flatMap((option, optionIndex) =>
    option.selected === true ? [optionIndex] : [],
  );
};
