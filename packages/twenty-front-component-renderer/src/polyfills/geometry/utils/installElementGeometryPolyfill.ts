import { remoteId } from '@remote-dom/core/elements';
import { isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { EMPTY_ELEMENT_GEOMETRY_SNAPSHOT } from '@/polyfills/geometry/constants/EmptyElementGeometrySnapshot';
import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { createDocumentScopedElementGeometrySnapshot } from '@/polyfills/geometry/utils/createDocumentScopedElementGeometrySnapshot';
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
  const isDocumentScopedElement = (element: object): boolean =>
    element === documentTarget.body ||
    element === documentTarget.documentElement;

  const resolveDocumentScopedSnapshotInHostViewportFrame = (
    element: object,
  ): ElementGeometrySnapshot => {
    const viewport = geometryStore.getViewportSnapshot();

    if (!isDefined(viewport)) {
      return EMPTY_ELEMENT_GEOMETRY_SNAPSHOT;
    }

    return createDocumentScopedElementGeometrySnapshot({
      viewport,
      isDocumentElement: element === documentTarget.documentElement,
    });
  };

  const resolveSnapshot = (element: object): ElementGeometrySnapshot | null => {
    try {
      if (isDocumentScopedElement(element)) {
        return resolveDocumentScopedSnapshotInHostViewportFrame(element);
      }

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
        const snapshot = resolveSnapshot(this);

        if (propertyName === 'scrollHeight') {
          return readTextareaIntrinsicSize({ element: this, snapshot });
        }

        return snapshot?.[propertyName] ?? 0;
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
    'scrollHeight',
  ] as const) {
    defineGeometryGetter({ propertyName });
  }

  for (const propertyName of ['scrollTop', 'scrollLeft'] as const) {
    defineGeometryGetter({ propertyName, hasNoOpSetter: true });
  }

  Object.defineProperty(elementPrototype, 'offsetParent', {
    get(this: object) {
      if (isDocumentScopedElement(this)) {
        return null;
      }

      const offsetParentRemoteElementId =
        geometryStore.readObservedElementSnapshot(
          this,
        )?.offsetParentRemoteElementId;
      if (!isDefined(offsetParentRemoteElementId)) {
        return documentTarget.body ?? null;
      }
      let ancestor = (this as { parentNode?: unknown }).parentNode;
      while (isObject(ancestor)) {
        if (remoteId(ancestor as Node) === offsetParentRemoteElementId) {
          return ancestor;
        }
        ancestor = (ancestor as { parentNode?: unknown }).parentNode;
      }
      return null;
    },
    configurable: true,
  });
};
