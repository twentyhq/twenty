import {
  isFunction,
  isNonEmptyString,
  isObject,
  isString,
} from '@sniptt/guards';

import { createStyleProxy } from '@/polyfills/dom/utils/createStyleProxy';
import { isObjectPrototypeMember } from '@/polyfills/dom/utils/isObjectPrototypeMember';
import { resolveCssPropertyNameFromJsPropertyName } from '@/polyfills/dom/utils/resolveCssPropertyNameFromJsPropertyName';
import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { hasMeasuredChildElement } from '@/polyfills/geometry/utils/hasMeasuredChildElement';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { normalizeCssPropertyName } from '@/utils/css/normalizeCssPropertyName';

export const installGetComputedStyle = ({
  globalScope,
  geometryStore,
}: {
  globalScope: Record<string, unknown>;
  geometryStore: WorkerGeometryStore;
}): void => {
  const getComputedStyle = (element: unknown, pseudoElement?: unknown) => {
    if (isNonEmptyString(pseudoElement) || !isObject(element)) {
      return createStyleProxy(() => {});
    }

    const declaredStyle = 'style' in element ? element.style : undefined;

    const readDeclaredProperty = (cssPropertyName: string): string => {
      if (!isObject(declaredStyle)) {
        return '';
      }
      const getDeclaredPropertyValue: unknown = Reflect.get(
        declaredStyle,
        'getPropertyValue',
      );
      if (!isFunction(getDeclaredPropertyValue)) {
        return '';
      }
      const declaredValue: unknown = getDeclaredPropertyValue.call(
        declaredStyle,
        cssPropertyName,
      );
      return isString(declaredValue) ? declaredValue : '';
    };

    const readMeasuredSnapshot = () =>
      geometryStore.readObservedElementSnapshot(element) ??
      (hasMeasuredChildElement({ element, geometryStore })
        ? geometryStore.resolveElementSnapshot(element)
        : null);

    const readProperty = (propertyName: string): string => {
      const cssPropertyName = normalizeCssPropertyName(propertyName);
      const measuredValue = isObjectPrototypeMember(cssPropertyName)
        ? undefined
        : readMeasuredSnapshot()?.computedStyle?.[cssPropertyName];

      return measuredValue ?? readDeclaredProperty(cssPropertyName);
    };

    return new Proxy(
      {},
      {
        get(target, property) {
          if (property === 'getPropertyValue') {
            return readProperty;
          }
          if (isObjectPrototypeMember(property)) {
            return Reflect.get(Object.prototype, property);
          }
          if (isString(property)) {
            return readProperty(
              resolveCssPropertyNameFromJsPropertyName(property),
            );
          }
          return Reflect.get(target, property);
        },
        set: () => false,
      },
    );
  };

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    installTarget.getComputedStyle = getComputedStyle;
  }
};
