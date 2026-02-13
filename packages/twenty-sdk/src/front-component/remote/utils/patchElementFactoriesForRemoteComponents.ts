import { HTML_TAG_TO_REMOTE_COMPONENT } from '@/sdk/front-component-common/HtmlTagToRemoteComponent';

type ElementFactory = (type: unknown, ...rest: unknown[]) => unknown;

const wrapElementFactory = (
  originalFactory: ElementFactory,
  remoteComponents: Record<string, unknown>,
): ElementFactory => {
  return (type: unknown, ...rest: unknown[]): unknown => {
    if (typeof type === 'string') {
      const remoteComponentName = HTML_TAG_TO_REMOTE_COMPONENT[type];
      const remoteComponent =
        remoteComponentName !== undefined
          ? remoteComponents[remoteComponentName]
          : undefined;

      if (remoteComponent !== undefined) {
        return originalFactory(remoteComponent, ...rest);
      }
    }

    return originalFactory(type, ...rest);
  };
};

export const patchElementFactoriesForRemoteComponents = (
  remoteComponents: Record<string, unknown>,
): void => {
  const reactGlobal = (globalThis as Record<string, unknown>).React as
    | Record<string, unknown>
    | undefined;

  if (reactGlobal?.createElement) {
    reactGlobal.createElement = wrapElementFactory(
      reactGlobal.createElement as ElementFactory,
      remoteComponents,
    );
  }

  const globals = globalThis as Record<string, unknown>;

  if (typeof globals.jsx === 'function') {
    globals.jsx = wrapElementFactory(
      globals.jsx as ElementFactory,
      remoteComponents,
    );
  }

  if (typeof globals.jsxs === 'function') {
    globals.jsxs = wrapElementFactory(
      globals.jsxs as ElementFactory,
      remoteComponents,
    );
  }
};
