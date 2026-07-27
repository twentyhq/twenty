import { isNonEmptyString, isString } from '@sniptt/guards';

import { type StyleProxy } from '@/polyfills/dom/types/StyleProxy';
import { formatCssValue } from '@/polyfills/dom/utils/formatCssValue';
import { isImportantPriorityKeyword } from '@/polyfills/dom/utils/isImportantPriorityKeyword';
import { isObjectPrototypeMember } from '@/polyfills/dom/utils/isObjectPrototypeMember';
import { normalizeCssPropertyName } from '@/utils/normalizeCssPropertyName';
import { parseCssTextIntoStyleDeclarations } from '@/polyfills/dom/utils/parseCssTextIntoStyleDeclarations';
import { resolveCssPropertyNameFromJsPropertyName } from '@/polyfills/dom/utils/resolveCssPropertyNameFromJsPropertyName';
import { serializeStyleDeclarationsToCssText } from '@/polyfills/dom/utils/serializeStyleDeclarationsToCssText';

export const createStyleProxy = (
  flushSerializedCssTextToHost: (serializedCssText: string) => void,
): StyleProxy => {
  const cssValueByCssPropertyName: Record<string, string> = {};

  const flushToHost = (): void => {
    flushSerializedCssTextToHost(
      serializeStyleDeclarationsToCssText(cssValueByCssPropertyName),
    );
  };

  const replaceAllDeclarationsFromCssText = (cssText: string): void => {
    for (const cssPropertyName of Object.keys(cssValueByCssPropertyName)) {
      delete cssValueByCssPropertyName[cssPropertyName];
    }

    Object.assign(
      cssValueByCssPropertyName,
      parseCssTextIntoStyleDeclarations(cssText),
    );
  };

  const setPropertyValue = (
    cssPropertyName: string,
    value: string | null,
    priority?: string,
  ): void => {
    const normalizedCssPropertyName = normalizeCssPropertyName(cssPropertyName);

    if (value === null || value === '') {
      delete cssValueByCssPropertyName[normalizedCssPropertyName];
      flushToHost();

      return;
    }

    if (isNonEmptyString(priority) && !isImportantPriorityKeyword(priority)) {
      return;
    }

    cssValueByCssPropertyName[normalizedCssPropertyName] = String(value);
    flushToHost();
  };

  const removePropertyValue = (cssPropertyName: string): string => {
    const normalizedCssPropertyName = normalizeCssPropertyName(cssPropertyName);
    const previousValue =
      cssValueByCssPropertyName[normalizedCssPropertyName] ?? '';

    delete cssValueByCssPropertyName[normalizedCssPropertyName];
    flushToHost();

    return previousValue;
  };

  const readPropertyValue = (cssPropertyName: string): string =>
    cssValueByCssPropertyName[normalizeCssPropertyName(cssPropertyName)] ?? '';

  return new Proxy(cssValueByCssPropertyName, {
    get: (target, property) => {
      if (property === 'cssText') {
        return serializeStyleDeclarationsToCssText(target);
      }

      if (property === 'setProperty') {
        return setPropertyValue;
      }

      if (property === 'removeProperty') {
        return removePropertyValue;
      }

      if (property === 'getPropertyValue') {
        return readPropertyValue;
      }

      if (isObjectPrototypeMember(property)) {
        return Reflect.get(Object.prototype, property);
      }

      if (isString(property)) {
        return target[resolveCssPropertyNameFromJsPropertyName(property)] ?? '';
      }

      return undefined;
    },
    set: (target, property, value) => {
      if (!isString(property)) {
        return true;
      }

      if (property === 'cssText') {
        replaceAllDeclarationsFromCssText(String(value));
        flushToHost();

        return true;
      }

      const cssPropertyName =
        resolveCssPropertyNameFromJsPropertyName(property);

      if (value === null || value === undefined || value === '') {
        delete target[cssPropertyName];
        flushToHost();

        return true;
      }

      target[cssPropertyName] = formatCssValue(value, property);
      flushToHost();

      return true;
    },
  }) as unknown as StyleProxy;
};
