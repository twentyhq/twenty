import { remoteId } from '@remote-dom/core/elements';
import { isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { createDomRectFromSnapshot } from '@/polyfills/geometry/utils/createDomRectFromSnapshot';
import { createTextareaIntrinsicSizeReader } from '@/polyfills/geometry/utils/createTextareaIntrinsicSizeReader';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

const EMPTY_ELEMENT_GEOMETRY_SNAPSHOT: ElementGeometrySnapshot = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  offsetWidth: 0,
  offsetHeight: 0,
  offsetTop: 0,
  offsetLeft: 0,
  clientWidth: 0,
  clientHeight: 0,
  clientTop: 0,
  clientLeft: 0,
  scrollWidth: 0,
  scrollHeight: 0,
  scrollTop: 0,
  scrollLeft: 0,
};

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

    const isDocumentElement = element === documentTarget.documentElement;

    return {
      ...EMPTY_ELEMENT_GEOMETRY_SNAPSHOT,
      x: viewport.rootContainerX,
      y: viewport.rootContainerY,
      width: viewport.rootContainerWidth,
      height: viewport.rootContainerHeight,
      offsetWidth: viewport.rootContainerWidth,
      offsetHeight: viewport.rootContainerHeight,
      clientWidth: viewport.rootContainerClientWidth,
      clientHeight: viewport.rootContainerClientHeight,
      scrollWidth: viewport.rootContainerClientWidth,
      scrollHeight: viewport.rootContainerClientHeight,
      scrollTop: isDocumentElement ? viewport.scrollY : 0,
      scrollLeft: isDocumentElement ? viewport.scrollX : 0,
    };
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

      const snapshot = resolveSnapshot(this);
      const offsetParentRemoteElementId = snapshot?.offsetParentRemoteElementId;
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
