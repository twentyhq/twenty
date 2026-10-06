export const getReactWrapperSource = ({
  readsElementRefFromVnode,
}: {
  readsElementRefFromVnode: boolean;
}): string =>
  `
export * from '__real_react__';
import React from '__real_react__';

import {
  customElementMap,
  injectStyleViaHead,
  extractCssText,
  withJsxEventRef,
  withCloneEventRef,
  isCustomElementTag,
} from '__jsx_shared_helpers__';

const originalCreateElement = React.createElement;
const originalCloneElement = React.cloneElement;
const readsElementRefFromVnode = ${readsElementRefFromVnode};

function getPropsArgument(elementArguments) {
  return elementArguments.length > 1 ? elementArguments[1] : null;
}

function replaceFirstTwoArguments(
  originalArguments,
  firstArgument,
  secondArgument,
) {
  return [
    firstArgument,
    secondArgument,
    ...Array.prototype.slice.call(originalArguments, 2),
  ];
}

function createElement(type) {
  const createElementArguments = arguments;
  if (typeof type !== 'string') {
    return originalCreateElement.apply(null, createElementArguments);
  }

  const props = getPropsArgument(createElementArguments);

  if (type === 'style') {
    const cssText =
      props && props.dangerouslySetInnerHTML
        ? props.dangerouslySetInnerHTML.__html || ''
        : extractCssText(props && props.children);
    injectStyleViaHead(cssText);
    return null;
  }

  const customElementTag = customElementMap[type];
  if (!customElementTag) {
    return originalCreateElement.apply(null, createElementArguments);
  }

  return originalCreateElement.apply(
    null,
    replaceFirstTwoArguments(
      createElementArguments,
      customElementTag,
      withJsxEventRef(props),
    ),
  );
}

function cloneElement(element) {
  const cloneElementArguments = arguments;
  const isCustomElement = !!element && isCustomElementTag(element.type);
  if (!isCustomElement) {
    return originalCloneElement.apply(null, cloneElementArguments);
  }

  const propsWithCloneEventRef = withCloneEventRef(
    element,
    getPropsArgument(cloneElementArguments),
    readsElementRefFromVnode,
  );

  return originalCloneElement.apply(
    null,
    replaceFirstTwoArguments(
      cloneElementArguments,
      element,
      propsWithCloneEventRef,
    ),
  );
}

export { createElement, cloneElement };
export default Object.assign({}, React, { createElement, cloneElement });
`.trim();
