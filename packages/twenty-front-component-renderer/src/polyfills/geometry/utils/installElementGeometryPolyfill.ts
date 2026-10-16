import { isDefined } from 'twenty-shared/utils';

import { findAncestorByRemoteId } from '@/polyfills/dom/utils/findAncestorByRemoteId';
import { type TextareaIntrinsicSizeElement } from '@/polyfills/geometry/types/TextareaIntrinsicSizeElement';
import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { createDomRectFromSnapshot } from '@/polyfills/geometry/utils/createDomRectFromSnapshot';
import { createTextareaIntrinsicSizeReader } from '@/polyfills/geometry/utils/createTextareaIntrinsicSizeReader';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

type InstallElementGeometryPolyfillInput = {
  elementPrototype: object;
  documentTarget: { body?: unknown; documentElement?: unknown };
  geometryStore: WorkerGeometryStore;
};

export const installElementGeometryPolyfill = ({
  elementPrototype,
  documentTarget,
  geometryStore,
}: InstallElementGeometryPolyfillInput): void => {
  const readTextareaIntrinsicSize =
    createTextareaIntrinsicSizeReader(geometryStore);

  const resolveSnapshot = (element: object): ElementGeometrySnapshot | null => {
    try {
      return geometryStore.resolveElementSnapshot(element);
    } catch {
      return null;
    }
  };

  Object.defineProperty(elementPrototype, 'getBoundingClientRect', {
    value: function (this: object) {
      return createDomRectFromSnapshot(resolveSnapshot(this));
    },
    configurable: true,
    writable: true,
  });

  const defineGeometryGetter = ({
    propertyName,
    hasNoOpSetter = false,
  }: {
    propertyName: keyof ElementGeometrySnapshot;
    hasNoOpSetter?: boolean;
  }): void => {
    Object.defineProperty(elementPrototype, propertyName, {
      get(this: object) {
        return resolveSnapshot(this)?.[propertyName] ?? 0;
      },
      ...(hasNoOpSetter && { set() {} }),
      configurable: true,
    });
  };

  for (const propertyName of [
    'offsetWidth',
    'offsetHeight',
    'offsetTop',
    'offsetLeft',
    'clientWidth',
    'clientHeight',
    'clientTop',
    'clientLeft',
    'scrollWidth',
  ] as const) {
    defineGeometryGetter({ propertyName });
  }

  for (const propertyName of ['scrollTop', 'scrollLeft'] as const) {
    defineGeometryGetter({ propertyName, hasNoOpSetter: true });
  }

  Object.defineProperty(elementPrototype, 'scrollHeight', {
    get(this: TextareaIntrinsicSizeElement) {
      return readTextareaIntrinsicSize({
        element: this,
        snapshot: resolveSnapshot(this),
      });
    },
    configurable: true,
  });

  Object.defineProperty(elementPrototype, 'offsetParent', {
    get(this: object) {
      if (
        this === documentTarget.body ||
        this === documentTarget.documentElement
      ) {
        return null;
      }

      const offsetParentRemoteElementId =
        geometryStore.readObservedElementSnapshot(
          this,
        )?.offsetParentRemoteElementId;

      if (!isDefined(offsetParentRemoteElementId)) {
        return documentTarget.body ?? null;
      }

      return findAncestorByRemoteId({
        node: this,
        remoteElementId: offsetParentRemoteElementId,
      });
    },
    configurable: true,
  });
};
