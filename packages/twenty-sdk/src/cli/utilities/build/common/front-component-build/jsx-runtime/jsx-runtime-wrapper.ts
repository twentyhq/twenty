import {
  Fragment,
  jsx as originalJsx,
  jsxs as originalJsxs,
} from '__real_react_jsx_runtime__';
import {
  CUSTOM_ELEMENT_TAG_BY_HTML_TAG,
  getStyleElementCssText,
  injectStyleViaHead,
  withJsxEventRef,
} from '__jsx_shared_helpers__';

import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';

type JsxFactory = (
  type: unknown,
  props: ElementProps | null | undefined,
  key?: unknown,
) => unknown;

const wrapJsxFactory = (originalJsxFactory: JsxFactory): JsxFactory =>
  function wrappedJsx(type, props, key) {
    if (typeof type !== 'string') {
      return originalJsxFactory(type, props, key);
    }

    if (type === 'style') {
      injectStyleViaHead(getStyleElementCssText(props));
      return null;
    }

    const customElementTag = CUSTOM_ELEMENT_TAG_BY_HTML_TAG[type];
    if (!customElementTag) {
      return originalJsxFactory(type, props, key);
    }

    return originalJsxFactory(customElementTag, withJsxEventRef(props), key);
  };

export const jsx = wrapJsxFactory(originalJsx);
export const jsxs = wrapJsxFactory(originalJsxs);
export { Fragment };
