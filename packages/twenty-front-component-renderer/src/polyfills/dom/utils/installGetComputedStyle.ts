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
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { normalizeCssPropertyName } from '@/utils/css/normalizeCssPropertyName';

export const installGetComputedStyle = ({
  globalScope,
  geometryStore,
  documentTarget,
}: {
  globalScope: Record<string, unknown>;
  geometryStore: WorkerGeometryStore;
  documentTarget: { body?: unknown; documentElement?: unknown };
}): void => {
  const createEmptyStyleDeclaration = () => createStyleProxy(() => {});

  const getComputedStyle = (element: unknown, pseudoElement?: unknown) => {
    if (isNonEmptyString(pseudoElement) || !isObject(element)) {
      return createEmptyStyleDeclaration();
    }

    const declaredStyle = 'style' in element ? element.style : undefined;
    const isDocumentScopedElement =
      element === documentTarget.body ||
      element === documentTarget.documentElement;

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

    const readProperty = (propertyName: string): string => {
      const cssPropertyName = normalizeCssPropertyName(propertyName);
      const snapshot = isDocumentScopedElement
        ? geometryStore.getViewportSnapshot()
        : geometryStore.readObservedElementSnapshot(element);
      const measuredValue: unknown = snapshot?.computedStyle?.[cssPropertyName];

      return isString(measuredValue)
        ? measuredValue
        : readDeclaredProperty(cssPropertyName);
    };

    return new Proxy(createEmptyStyleDeclaration(), {
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
    });
  };

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    installTarget.getComputedStyle = getComputedStyle;
  }
};
