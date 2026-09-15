import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { ALLOWED_HTML_ELEMENTS } from '@/constants/AllowedHtmlElements';
import { type StyleProxy } from '@/polyfills/dom/types/StyleProxy';
import { createStyleProxy } from '@/polyfills/dom/utils/createStyleProxy';

type RemoteElementLike = Element & {
  updateRemoteProperty: (name: string, value: unknown) => void;
};

const createRemoteStyleProxy = (element: RemoteElementLike): StyleProxy =>
  createStyleProxy((serializedCssText) => {
    element.updateRemoteProperty(
      'style',
      isNonEmptyString(serializedCssText) ? serializedCssText : undefined,
    );
  });

export const installStylePropertyOnRemoteElements = (): void => {
  const styleProxies = new WeakMap<Element, StyleProxy>();

  const resolveStyleProxy = (element: RemoteElementLike): StyleProxy => {
    const existingProxy = styleProxies.get(element);

    if (isDefined(existingProxy)) {
      return existingProxy;
    }

    const createdProxy = createRemoteStyleProxy(element);
    styleProxies.set(element, createdProxy);

    return createdProxy;
  };

  for (const elementConfig of ALLOWED_HTML_ELEMENTS) {
    const elementConstructor = customElements.get(elementConfig.tag);

    if (!isDefined(elementConstructor)) {
      continue;
    }

    Object.defineProperty(elementConstructor.prototype, 'style', {
      get(this: RemoteElementLike) {
        return resolveStyleProxy(this);
      },
      set(this: RemoteElementLike, value: unknown) {
        if (isString(value)) {
          resolveStyleProxy(this).cssText = value;
        }
      },
      configurable: true,
    });
  }
};
