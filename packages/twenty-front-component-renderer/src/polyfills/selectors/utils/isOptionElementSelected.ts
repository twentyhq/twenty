import { isArray, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { collectChildNodes } from '@/polyfills/selectors/utils/collectChildNodes';
import { hasElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/hasElementAttributeIgnoringCase';
import { isElementDisabled } from '@/polyfills/selectors/utils/isElementDisabled';
import { readBooleanControlState } from '@/polyfills/selectors/utils/readBooleanControlState';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveParentElement } from '@/polyfills/selectors/utils/resolveParentElement';

const isElementWithTagName = (
  element: SelectorElementLike | null,
  tagName: string,
): element is SelectorElementLike =>
  isDefined(element) && resolveHtmlTagNameOfElement(element) === tagName;

const resolveOwnerSelectElement = (
  option: SelectorElementLike,
): SelectorElementLike | null => {
  const parentElement = resolveParentElement(option);

  if (isElementWithTagName(parentElement, 'select')) {
    return parentElement;
  }

  if (!isElementWithTagName(parentElement, 'optgroup')) {
    return null;
  }

  const optgroupParentElement = resolveParentElement(parentElement);

  return isElementWithTagName(optgroupParentElement, 'select')
    ? optgroupParentElement
    : null;
};

const collectOptionsOfSelect = (
  select: SelectorElementLike,
): SelectorElementLike[] =>
  collectChildNodes(select).flatMap((childNode) => {
    if (isElementWithTagName(childNode, 'option')) {
      return [childNode];
    }

    return isElementWithTagName(childNode, 'optgroup')
      ? collectChildNodes(childNode).filter((optgroupChildNode) =>
          isElementWithTagName(optgroupChildNode, 'option'),
        )
      : [];
  });

const resolveOptionValue = (option: SelectorElementLike): string =>
  readElementAttributeIgnoringCase(option, 'value') ??
  (isString(option.textContent)
    ? option.textContent.replace(/\s+/g, ' ').trim()
    : '');

const isOptionSelectedByDefault = ({
  option,
  select,
}: {
  option: SelectorElementLike;
  select: SelectorElementLike;
}): boolean => {
  if (hasElementAttributeIgnoringCase(select, 'multiple')) {
    return false;
  }

  const options = collectOptionsOfSelect(select);

  if (
    options.some((candidateOption) =>
      readBooleanControlState({
        element: candidateOption,
        propertyName: 'selected',
      }),
    )
  ) {
    return false;
  }

  return (
    options.find((candidateOption) => !isElementDisabled(candidateOption)) ===
    option
  );
};

export const isOptionElementSelected = (
  option: SelectorElementLike,
): boolean => {
  const select = resolveOwnerSelectElement(option);
  const selectValue = select?.value;

  if (isString(selectValue)) {
    return resolveOptionValue(option) === selectValue;
  }

  if (isArray(selectValue)) {
    return selectValue.includes(resolveOptionValue(option));
  }

  if (readBooleanControlState({ element: option, propertyName: 'selected' })) {
    return true;
  }

  return isDefined(select) && isOptionSelectedByDefault({ option, select });
};
