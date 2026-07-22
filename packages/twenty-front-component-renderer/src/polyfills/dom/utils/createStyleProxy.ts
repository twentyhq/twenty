import { splitCssDeclarations } from '@/polyfills/dom/utils/splitCssDeclarations';

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

type CreateStyleProxyOptions = {
  flush?: (cssText: string) => void;
  convertNumbersToPx?: boolean;
};

export const createStyleProxy = ({
  flush,
  convertNumbersToPx = false,
}: CreateStyleProxyOptions = {}): Record<string, unknown> => {
  const styleStore: Record<string, string> = {};

  const serializeCssText = (): string =>
    Object.entries(styleStore)
      .map(([key, value]) => `${key}:${value}`)
      .join(';');

  const flushSerializedCssText = (): void => {
    flush?.(serializeCssText());
  };

  const applyCssText = (cssText: string): void => {
    for (const key of Object.keys(styleStore)) {
      delete styleStore[key];
    }

    for (const declaration of splitCssDeclarations(cssText)) {
      const colonIndex = declaration.indexOf(':');

      if (colonIndex <= 0) {
        continue;
      }

      const declarationKey = declaration.slice(0, colonIndex).trim();
      const declarationValue = declaration.slice(colonIndex + 1).trim();

      if (declarationKey !== '' && declarationValue !== '') {
        styleStore[declarationKey] = declarationValue;
      }
    }
  };

  return new Proxy(styleStore, {
    get: (target, property) => {
      if (property === 'cssText') {
        return serializeCssText();
      }

      if (property === 'setProperty') {
        return (name: string, value: string | null) => {
          if (value === null || value === '') {
            delete target[name];
          } else {
            target[name] = String(value);
          }

          flushSerializedCssText();
        };
      }

      if (property === 'removeProperty') {
        return (name: string): string => {
          const previousValue = target[name] ?? '';
          delete target[name];
          flushSerializedCssText();

          return previousValue;
        };
      }

      if (property === 'getPropertyValue') {
        return (name: string): string => target[name] ?? '';
      }

      if (typeof property === 'string') {
        return target[camelToKebab(property)] ?? '';
      }

      return undefined;
    },
    set: (target, property, value) => {
      if (typeof property !== 'string') {
        return true;
      }

      if (property === 'cssText') {
        applyCssText(String(value));
        flushSerializedCssText();

        return true;
      }

      const kebabKey = camelToKebab(property);

      if (value === null || value === undefined || value === '') {
        delete target[kebabKey];
        flushSerializedCssText();

        return true;
      }

      const shouldConvertToPx =
        convertNumbersToPx &&
        typeof value === 'number' &&
        value !== 0 &&
        !UNITLESS_CSS_PROPERTIES.has(property);

      target[kebabKey] = shouldConvertToPx ? `${value}px` : String(value);
      flushSerializedCssText();

      return true;
    },
  });
};
