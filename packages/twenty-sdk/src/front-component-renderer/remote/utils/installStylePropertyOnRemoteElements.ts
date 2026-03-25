import { ALLOWED_HTML_ELEMENTS } from '@/sdk/front-component-api/constants/AllowedHtmlElements';

const camelToKebab = (property: string): string =>
  property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

const UNITLESS_CSS_PROPERTIES = new Set([
  'animationIterationCount',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'columns',
  'flex',
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexNegative',
  'flexOrder',
  'gridArea',
  'gridRow',
  'gridRowEnd',
  'gridRowSpan',
  'gridRowStart',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnSpan',
  'gridColumnStart',
  'fontWeight',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
  'fillOpacity',
  'floodOpacity',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
]);

type FlushFn = (cssText: string) => void;

const createStyleProxy = (flush: FlushFn): Record<string, unknown> => {
  const styleStore: Record<string, string> = {};

  const flushToRemoteProperty = (): void => {
    const cssText = Object.entries(styleStore)
      .map(([key, value]) => `${key}:${value}`)
      .join(';');

    flush(cssText);
  };

  return new Proxy(styleStore, {
    get: (target, property) => {
      if (property === 'cssText') {
        return Object.entries(target)
          .map(([key, value]) => `${key}:${value}`)
          .join(';');
      }

      if (property === 'setProperty') {
        return (name: string, value: string | null) => {
          if (value === null || value === '') {
            delete target[name];
          } else {
            target[name] = String(value);
          }

          flushToRemoteProperty();
        };
      }

      if (property === 'removeProperty') {
        return (name: string): string => {
          const oldValue = target[name] ?? '';

          delete target[name];
          flushToRemoteProperty();

          return oldValue;
        };
      }

      if (property === 'getPropertyValue') {
        return (name: string): string => target[name] ?? '';
      }

      if (typeof property === 'string') {
        const kebabKey = camelToKebab(property);

        return target[kebabKey] ?? '';
      }

      return undefined;
    },
    set: (target, property, value) => {
      if (property === 'cssText') {
        for (const key of Object.keys(target)) {
          delete target[key];
        }

        String(value)
          .split(';')
          .forEach((pair) => {
            const colonIndex = pair.indexOf(':');

            if (colonIndex > 0) {
              const key = pair.slice(0, colonIndex).trim();
              const val = pair.slice(colonIndex + 1).trim();

              if (key && val) {
                target[key] = val;
              }
            }
          });

        flushToRemoteProperty();

        return true;
      }

      if (typeof property === 'string') {
        const kebabKey = camelToKebab(property);

        if (value === null || value === undefined || value === '') {
          delete target[kebabKey];
        } else {
          let stringValue = String(value);

          if (
            typeof value === 'number' &&
            value !== 0 &&
            !UNITLESS_CSS_PROPERTIES.has(property)
          ) {
            stringValue = `${value}px`;
          }

          target[kebabKey] = stringValue;
        }

        flushToRemoteProperty();

        return true;
      }

      return true;
    },
  });
};

type RemoteElementLike = Element & {
  updateRemoteProperty: (name: string, value: unknown) => void;
};

export const installStylePropertyOnRemoteElements = (): void => {
  for (const elementConfig of ALLOWED_HTML_ELEMENTS) {
    const elementConstructor = customElements.get(elementConfig.tag);

    if (!elementConstructor) {
      continue;
    }

    const styleProxies = new WeakMap<Element, Record<string, unknown>>();

    Object.defineProperty(elementConstructor.prototype, 'style', {
      get(this: RemoteElementLike) {
        let proxy = styleProxies.get(this);

        if (!proxy) {
          const element = this;

          const flush: FlushFn = (cssText: string) => {
            element.updateRemoteProperty('style', cssText || undefined);
          };

          proxy = createStyleProxy(flush);
          styleProxies.set(this, proxy);
        }

        return proxy;
      },
      set(this: RemoteElementLike, value: unknown) {
        let proxy = styleProxies.get(this);

        if (!proxy) {
          const element = this;
          const flush: FlushFn = (cssText: string) => {
            element.updateRemoteProperty('style', cssText || undefined);
          };

          proxy = createStyleProxy(flush);
          styleProxies.set(this, proxy);
        }

        if (typeof value === 'string') {
          (proxy as Record<string, unknown>).cssText = value;
        }
      },
      configurable: true,
    });
  }
};
