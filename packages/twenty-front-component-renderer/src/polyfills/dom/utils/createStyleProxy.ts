import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { formatStyleValueForCssStore } from '@/polyfills/dom/utils/formatStyleValueForCssStore';
import { isImportantPriorityKeyword } from '@/polyfills/dom/utils/isImportantPriorityKeyword';
import { isObjectPrototypeMember } from '@/polyfills/dom/utils/isObjectPrototypeMember';
import { parseCssTextIntoStyleDeclarations } from '@/polyfills/dom/utils/parseCssTextIntoStyleDeclarations';
import { resolveStyleStoreKeyFromPropertyName } from '@/polyfills/dom/utils/resolveStyleStoreKeyFromPropertyName';
import { serializeStyleDeclarationsToCssText } from '@/polyfills/dom/utils/serializeStyleDeclarationsToCssText';
import { createMicrotaskCoalescedCallback } from '@/utils/createMicrotaskCoalescedCallback';

type CreateStyleProxyOptions = {
  flushSerializedCssTextToHost?: (serializedCssText: string) => void;
  shouldConvertNumbersToPixels?: boolean;
};

export const createStyleProxy = ({
  flushSerializedCssTextToHost,
  shouldConvertNumbersToPixels = false,
}: CreateStyleProxyOptions = {}): Record<string, unknown> => {
  const cssValueByStoreKey: Record<string, string> = {};
  const importantPriorityStoreKeys = new Set<string>();

  const readSerializedCssText = (): string =>
    serializeStyleDeclarationsToCssText(
      cssValueByStoreKey,
      importantPriorityStoreKeys,
    );

  const scheduleHostFlush = isDefined(flushSerializedCssTextToHost)
    ? createMicrotaskCoalescedCallback(() => {
        flushSerializedCssTextToHost(readSerializedCssText());
      })
    : () => {};

  const replaceAllDeclarationsFromCssText = (cssText: string): void => {
    for (const storeKey of Object.keys(cssValueByStoreKey)) {
      delete cssValueByStoreKey[storeKey];
    }
    importantPriorityStoreKeys.clear();

    const parsedDeclarations = parseCssTextIntoStyleDeclarations(cssText);

    Object.assign(cssValueByStoreKey, parsedDeclarations.cssValueByStoreKey);

    for (const storeKey of parsedDeclarations.importantPriorityStoreKeys) {
      importantPriorityStoreKeys.add(storeKey);
    }
  };

  const setPropertyValue = (
    cssPropertyName: string,
    value: string | null,
    priority?: string,
  ): void => {
    if (value === null || value === '') {
      delete cssValueByStoreKey[cssPropertyName];
      importantPriorityStoreKeys.delete(cssPropertyName);
      scheduleHostFlush();

      return;
    }

    const hasExplicitPriority = isNonEmptyString(priority);

    if (hasExplicitPriority && !isImportantPriorityKeyword(priority)) {
      return;
    }

    cssValueByStoreKey[cssPropertyName] = String(value);

    if (hasExplicitPriority) {
      importantPriorityStoreKeys.add(cssPropertyName);
    } else {
      importantPriorityStoreKeys.delete(cssPropertyName);
    }

    scheduleHostFlush();
  };

  const removePropertyValue = (cssPropertyName: string): string => {
    const previousValue = cssValueByStoreKey[cssPropertyName] ?? '';

    delete cssValueByStoreKey[cssPropertyName];
    importantPriorityStoreKeys.delete(cssPropertyName);
    scheduleHostFlush();

    return previousValue;
  };

  const readPropertyValue = (cssPropertyName: string): string =>
    cssValueByStoreKey[cssPropertyName] ?? '';

  const readPropertyPriority = (cssPropertyName: string): string =>
    importantPriorityStoreKeys.has(cssPropertyName) ? 'important' : '';

  return new Proxy(cssValueByStoreKey, {
    get: (target, property) => {
      if (property === 'cssText') {
        return readSerializedCssText();
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

      if (property === 'getPropertyPriority') {
        return readPropertyPriority;
      }

      if (isObjectPrototypeMember(property)) {
        return Reflect.get(Object.prototype, property);
      }

      if (isString(property)) {
        return target[resolveStyleStoreKeyFromPropertyName(property)] ?? '';
      }

      return undefined;
    },
    set: (target, property, value) => {
      if (!isString(property)) {
        return true;
      }

      if (property === 'cssText') {
        replaceAllDeclarationsFromCssText(String(value));
        scheduleHostFlush();

        return true;
      }

      const storeKey = resolveStyleStoreKeyFromPropertyName(property);
      importantPriorityStoreKeys.delete(storeKey);

      if (value === null || value === undefined || value === '') {
        delete target[storeKey];
        scheduleHostFlush();

        return true;
      }

      target[storeKey] = formatStyleValueForCssStore(
        value,
        property,
        shouldConvertNumbersToPixels,
      );
      scheduleHostFlush();

      return true;
    },
  });
};
