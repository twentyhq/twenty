export const JSX_RUNTIME_WRAPPER_SOURCE = `
import {
  jsx as originalJsx,
  jsxs as originalJsxs,
  Fragment,
} from '__real_react_jsx_runtime__';

import {
  customElementMap,
  injectStyleViaHead,
  extractCssText,
  withJsxEventRef,
} from '__jsx_shared_helpers__';

function wrapJsxFactory(originalJsxFactory) {
  return function wrappedJsx(type, props, key) {
    if (typeof type !== 'string') {
      return originalJsxFactory(type, props, key);
    }

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
      return originalJsxFactory(type, props, key);
    }

    return originalJsxFactory(customElementTag, withJsxEventRef(props), key);
  };
}

export const jsx = wrapJsxFactory(originalJsx);
export const jsxs = wrapJsxFactory(originalJsxs);
export { Fragment };
`.trim();
