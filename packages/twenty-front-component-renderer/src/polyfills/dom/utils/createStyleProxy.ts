import { isNonEmptyString, isNumber, isString } from '@sniptt/guards';
import { camelToKebab, isDefined } from 'twenty-shared/utils';

import { CSS_IMPORTANT_PRIORITY_PATTERN } from '@/constants/CssImportantPriorityPattern';
import { splitCssDeclarations } from '@/utils/splitCssDeclarations';

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
  const stylePriorities: Record<string, string> = {};

  let hasScheduledFlush = false;

  const serializeCssText = (): string =>
    Object.entries(styleStore)
      .map(([key, value]) =>
        isNonEmptyString(stylePriorities[key])
          ? `${key}:${value} !important`
          : `${key}:${value}`,
      )
      .join(';');

  // Coalesced per microtask so a burst of property writes serializes and
  // reaches the host once instead of once per write.
  const flushSerializedCssText = (): void => {
    if (!isDefined(flush) || hasScheduledFlush) {
      return;
    }

    hasScheduledFlush = true;
    queueMicrotask(() => {
      hasScheduledFlush = false;
      flush(serializeCssText());
    });
  };

  const applyCssText = (cssText: string): void => {
    for (const key of Object.keys(styleStore)) {
      delete styleStore[key];
      delete stylePriorities[key];
    }

    for (const declaration of splitCssDeclarations(cssText)) {
      const colonIndex = declaration.indexOf(':');

      if (colonIndex <= 0) {
        continue;
      }

      const declarationKey = declaration.slice(0, colonIndex).trim();
      const declarationValue = declaration.slice(colonIndex + 1).trim();
      const hasImportantPriority =
        CSS_IMPORTANT_PRIORITY_PATTERN.test(declarationValue);
      const declarationValueWithoutPriority = hasImportantPriority
        ? declarationValue.replace(CSS_IMPORTANT_PRIORITY_PATTERN, '').trim()
        : declarationValue;

      if (declarationKey === '' || declarationValueWithoutPriority === '') {
        continue;
      }

      const isExistingDeclarationImportant = isNonEmptyString(
        stylePriorities[declarationKey],
      );

      if (isExistingDeclarationImportant && !hasImportantPriority) {
        continue;
      }

      styleStore[declarationKey] = declarationValueWithoutPriority;

      if (hasImportantPriority) {
        stylePriorities[declarationKey] = 'important';
      }
    }
  };

  return new Proxy(styleStore, {
    get: (target, property) => {
      if (property === 'cssText') {
        return serializeCssText();
      }

      if (property === 'setProperty') {
        return (name: string, value: string | null, priority?: string) => {
          if (value === null || value === '') {
            delete target[name];
            delete stylePriorities[name];
          } else {
            target[name] = String(value);

            if (
              isNonEmptyString(priority) &&
              priority.toLowerCase() === 'important'
            ) {
              stylePriorities[name] = 'important';
            } else {
              delete stylePriorities[name];
            }
          }

          flushSerializedCssText();
        };
      }

      if (property === 'removeProperty') {
        return (name: string): string => {
          const previousValue = target[name] ?? '';
          delete target[name];
          delete stylePriorities[name];
          flushSerializedCssText();

          return previousValue;
        };
      }

      if (property === 'getPropertyValue') {
        return (name: string): string => target[name] ?? '';
      }

      if (property === 'getPropertyPriority') {
        return (name: string): string => stylePriorities[name] ?? '';
      }

      // No CSS property collides with an Object.prototype member after
      // camelToKebab, and shadowing them with '' breaks style.hasOwnProperty()
      // calls and string coercion of the proxy.
      if (property in Object.prototype) {
        return Reflect.get(Object.prototype, property);
      }

      if (isString(property)) {
        return target[camelToKebab(property)] ?? '';
      }

      return undefined;
    },
    set: (target, property, value) => {
      if (!isString(property)) {
        return true;
      }

      if (property === 'cssText') {
        applyCssText(String(value));
        flushSerializedCssText();

        return true;
      }

      const kebabKey = camelToKebab(property);
      delete stylePriorities[kebabKey];

      if (value === null || value === undefined || value === '') {
        delete target[kebabKey];
        flushSerializedCssText();

        return true;
      }

      const shouldConvertToPx =
        convertNumbersToPx &&
        isNumber(value) &&
        value !== 0 &&
        !UNITLESS_CSS_PROPERTIES.has(property);

      target[kebabKey] = shouldConvertToPx ? `${value}px` : String(value);
      flushSerializedCssText();

      return true;
    },
  });
};
