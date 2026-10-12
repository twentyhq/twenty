import {
  isFunction,
  isNonEmptyString,
  isObject,
  isString,
} from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { createStyleProxy } from '@/polyfills/dom/utils/createStyleProxy';
import { resolveCssPropertyNameFromJsPropertyName } from '@/polyfills/dom/utils/resolveCssPropertyNameFromJsPropertyName';
import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';

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
    const readProperty = (propertyName: string): string => {
      const isDocumentElement =
        element === documentTarget.body ||
        element === documentTarget.documentElement;
      const snapshot = isDocumentElement
        ? geometryStore.getViewportSnapshot()
        : geometryStore.resolveElementSnapshot(element);
      const measuredValue = snapshot?.computedStyle?.[propertyName];
      if (isDefined(measuredValue)) {
        return measuredValue;
      }
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
        propertyName,
      );
      return isString(declaredValue) ? declaredValue : '';
    };

    return new Proxy(createEmptyStyleDeclaration(), {
      get(target, property) {
        if (property === 'getPropertyValue') {
          return readProperty;
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
