import React from '__real_react__';
import {
  CUSTOM_ELEMENT_TAG_BY_HTML_TAG,
  getStyleElementCssText,
  injectStyleViaHead,
  isCustomElementTag,
  withCloneEventRef,
  withJsxEventRef,
} from '__jsx_shared_helpers__';
import { READS_ELEMENT_REF_FROM_VNODE } from '__reads_element_ref_from_vnode__';

import { type ClonedElement } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/cloned-element.type';
import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';

export * from '__real_react__';

type ArgumentsAfterFirst = [
  props?: ElementProps | null,
  ...children: unknown[],
];

const originalCreateElement = React.createElement;
const originalCloneElement = React.cloneElement;

const getPropsArgument = (argumentsAfterFirst: ArgumentsAfterFirst) =>
  argumentsAfterFirst.length > 0 ? argumentsAfterFirst[0] : null;

const replaceFirstTwoArguments = (
  argumentsAfterFirst: ArgumentsAfterFirst,
  firstArgument: unknown,
  secondArgument: unknown,
) => [firstArgument, secondArgument, ...argumentsAfterFirst.slice(1)];

function createElement(
  type: unknown,
  ...argumentsAfterType: ArgumentsAfterFirst
) {
  if (typeof type !== 'string') {
    return originalCreateElement.apply(null, [type, ...argumentsAfterType]);
  }

  const props = getPropsArgument(argumentsAfterType);

  if (type === 'style') {
    injectStyleViaHead(getStyleElementCssText(props));
    return null;
  }

  const customElementTag = CUSTOM_ELEMENT_TAG_BY_HTML_TAG[type];
  if (!customElementTag) {
    return originalCreateElement.apply(null, [type, ...argumentsAfterType]);
  }

  return originalCreateElement.apply(
    null,
    replaceFirstTwoArguments(
      argumentsAfterType,
      customElementTag,
      withJsxEventRef(props),
    ),
  );
}

function cloneElement(
  element: ClonedElement | null | undefined,
  ...argumentsAfterElement: ArgumentsAfterFirst
) {
  const isCustomElement = !!element && isCustomElementTag(element.type);
  if (!isCustomElement) {
    return originalCloneElement.apply(null, [
      element,
      ...argumentsAfterElement,
    ]);
  }

  const propsWithCloneEventRef = withCloneEventRef(
    element,
    getPropsArgument(argumentsAfterElement),
    READS_ELEMENT_REF_FROM_VNODE,
  );

  return originalCloneElement.apply(
    null,
    replaceFirstTwoArguments(
      argumentsAfterElement,
      element,
      propsWithCloneEventRef,
    ),
  );
}

export { cloneElement, createElement };
export default Object.assign({}, React, { createElement, cloneElement });
