import { isString } from '@sniptt/guards';

import { ALLOWED_HTML_ELEMENTS } from '@/constants/AllowedHtmlElements';
import { createStyleProxy } from '@/polyfills/dom/utils/createStyleProxy';

type RemoteElementLike = Element & {
  updateRemoteProperty: (name: string, value: unknown) => void;
};

const createRemoteStyleProxy = (
  element: RemoteElementLike,
): Record<string, unknown> =>
  createStyleProxy({
    flushSerializedCssTextToHost: (serializedCssText: string) => {
      element.updateRemoteProperty('style', serializedCssText || undefined);
    },
    shouldConvertNumbersToPixels: true,
  });

export const installStylePropertyOnRemoteElements = (): void => {
  const styleProxies = new WeakMap<Element, Record<string, unknown>>();

  const resolveStyleProxy = (
    element: RemoteElementLike,
  ): Record<string, unknown> => {
    let proxy = styleProxies.get(element);

    if (!proxy) {
      proxy = createRemoteStyleProxy(element);
      styleProxies.set(element, proxy);
    }

    return proxy;
  };

  for (const elementConfig of ALLOWED_HTML_ELEMENTS) {
    const elementConstructor = customElements.get(elementConfig.tag);

    if (!elementConstructor) {
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
