const REACT_WRAPPER_RUNTIME_PARTS = {
  react: {
    refCompatImport: '',
    cloneNonCustomElement:
      'return originalCloneElement.apply(null, cloneElementArguments);',
    overriddenExports: 'createElement, cloneElement',
  },
  preact: {
    refCompatImport:
      "import { memo, normalizeClonedElementRef, useImperativeHandle } from '__preact_ref_compat__';",
    cloneNonCustomElement: `return normalizeClonedElementRef({
      element,
      clonedElement: originalCloneElement.apply(null, cloneElementArguments),
      config: getPropsArgument(cloneElementArguments),
    });`,
    overriddenExports: 'createElement, cloneElement, memo, useImperativeHandle',
  },
};

export const getReactWrapperSource = ({
  usePreact,
}: {
  usePreact: boolean;
}): string => {
  const { refCompatImport, cloneNonCustomElement, overriddenExports } =
    REACT_WRAPPER_RUNTIME_PARTS[usePreact ? 'preact' : 'react'];

  return `
export * from '__real_react__';
import React from '__real_react__';
${refCompatImport}

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
const readsElementRefFromVnode = ${usePreact};

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
    ${cloneNonCustomElement}
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

export { ${overriddenExports} };
export default Object.assign({}, React, { ${overriddenExports} });
`.trim();
};
