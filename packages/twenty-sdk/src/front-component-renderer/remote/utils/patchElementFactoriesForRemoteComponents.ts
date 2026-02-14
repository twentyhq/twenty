  import { HTML_TAG_TO_REMOTE_COMPONENT } from '@/sdk/front-component-api/constants/HtmlTagToRemoteComponent';

type ElementFactory = (type: unknown, ...rest: unknown[]) => unknown;

const extractCssText = (children: unknown): string => {
  if (typeof children === 'string') {
    return children;
  }

  if (Array.isArray(children)) {
    return children
      .map((child) => (typeof child === 'string' ? child : ''))
      .join('');
  }

  return '';
};

// Tracks injected styles to avoid duplicates on re-renders
const injectedStyleKeys = new Set<string>();

const injectStyleViaHead = (cssText: string): void => {
  if (!cssText) {
    return;
  }

  // Simple hash to deduplicate identical CSS
  let hash = 0;

  for (let charIndex = 0; charIndex < cssText.length; charIndex++) {
    hash = ((hash << 5) - hash + cssText.charCodeAt(charIndex)) | 0;
  }

  const styleKey = `jsx-style-${hash}`;

  if (injectedStyleKeys.has(styleKey)) {
    return;
  }

  injectedStyleKeys.add(styleKey);

  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-jsx-style', styleKey);
  styleElement.textContent = cssText;
  document.head.appendChild(styleElement);
};

const wrapElementFactory = (
  originalFactory: ElementFactory,
  remoteComponents: Record<string, unknown>,
): ElementFactory => {
  return (type: unknown, ...rest: unknown[]): unknown => {
    if (typeof type === 'string') {
      // Intercept <style> tags: extract CSS and inject via document.head
      // The style bridge will pick it up and create remote-style elements
      if (type === 'style') {
        const props = (rest[0] ?? {}) as Record<string, unknown>;
        const { children, dangerouslySetInnerHTML } = props;

        const innerHtml = dangerouslySetInnerHTML as
          | { __html: string }
          | undefined;

        const cssText =
          innerHtml?.__html !== undefined
            ? innerHtml.__html
            : extractCssText(children);

        injectStyleViaHead(cssText);

        return null;
      }

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
