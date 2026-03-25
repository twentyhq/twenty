import { type RemoteRootElement } from '@remote-dom/core/elements';

import { type RemoteStyleProperties } from '@/front-component-renderer/remote/generated/remote-elements';
import { MockCSSStyleSheet } from './MockCSSStyleSheet';

export const installStyleBridge = (remoteRoot: RemoteRootElement): void => {
  const styleElementMap = new WeakMap<
    Element,
    Element & RemoteStyleProperties
  >();
  const styleObserverMap = new WeakMap<Element, { disconnect: () => void }>();

  const trackStyleElement = (styleElement: Element): void => {
    if (styleElementMap.has(styleElement)) {
      return;
    }

    const remoteStyleElement = document.createElement(
      'remote-style',
    ) as Element & RemoteStyleProperties;

    styleElementMap.set(styleElement, remoteStyleElement);

    const attributeNames = styleElement.getAttributeNames?.() ?? [];
    const dataAttributes = attributeNames
      .filter((attributeName: string) => attributeName.startsWith('data-'))
      .map(
        (attributeName: string) =>
          `${attributeName}=${styleElement.getAttribute(attributeName) ?? ''}`,
      )
      .join(';');

    if (dataAttributes.length > 0) {
      remoteStyleElement.styleKey = dataAttributes;
    }

    const syncCssFromStyleElement = () => {
      remoteStyleElement.cssText = styleElement.textContent ?? '';
    };

    const mockSheet = new MockCSSStyleSheet((cssText: string) => {
      remoteStyleElement.cssText = cssText;
    });

    try {
      Object.defineProperty(styleElement, 'sheet', {
        get: () => mockSheet,
        configurable: true,
      });
    } catch {
      void 0;
    }

    const prototypeChain = Object.getPrototypeOf(styleElement);
    const textContentDescriptor =
      Object.getOwnPropertyDescriptor(styleElement, 'textContent') ??
      Object.getOwnPropertyDescriptor(prototypeChain, 'textContent') ??
      Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(prototypeChain),
        'textContent',
      );

    if (textContentDescriptor?.set) {
      const originalTextContentSet = textContentDescriptor.set;
      try {
        Object.defineProperty(styleElement, 'textContent', {
          get: textContentDescriptor.get,
          set(value: string) {
            originalTextContentSet.call(this, value);
            remoteStyleElement.cssText = value ?? '';
          },
          configurable: true,
        });
      } catch {
        void 0;
      }
    }

    const originalAppendChild = styleElement.appendChild.bind(styleElement);
    try {
      (
        styleElement as Element & { appendChild: typeof originalAppendChild }
      ).appendChild = (child: Node) => {
        const result = originalAppendChild(child);
        syncCssFromStyleElement();
        return result;
      };
    } catch {
      void 0;
    }

    const originalInsertBeforeOnStyle =
      styleElement.insertBefore.bind(styleElement);
    try {
      (
        styleElement as Element & {
          insertBefore: typeof originalInsertBeforeOnStyle;
        }
      ).insertBefore = <T extends Node>(child: T, ref: Node | null): T => {
        const result = originalInsertBeforeOnStyle(child, ref);
        syncCssFromStyleElement();
        return result;
      };
    } catch {
      void 0;
    }

    const originalRemoveChildOnStyle =
      styleElement.removeChild.bind(styleElement);
    try {
      (
        styleElement as Element & {
          removeChild: typeof originalRemoveChildOnStyle;
        }
      ).removeChild = <T extends Node>(child: T): T => {
        const result = originalRemoveChildOnStyle(child);
        syncCssFromStyleElement();
        return result;
      };
    } catch {
      void 0;
    }

    if (typeof MutationObserver === 'function') {
      try {
        const styleObserver = new MutationObserver(() => {
          syncCssFromStyleElement();
        });

        if (typeof styleObserver.observe === 'function') {
          styleObserver.observe(styleElement, {
            subtree: true,
            childList: true,
            characterData: true,
          });
          styleObserverMap.set(styleElement, styleObserver);
        }
      } catch {
        void 0;
      }
    }

    const existingContent = styleElement.textContent;
    if (existingContent) {
      remoteStyleElement.cssText = existingContent;
    }

    remoteRoot.appendChild(remoteStyleElement);
  };

  const untrackStyleElement = (styleElement: Element): void => {
    const styleObserver = styleObserverMap.get(styleElement);
    if (styleObserver) {
      styleObserver.disconnect();
      styleObserverMap.delete(styleElement);
    }

    const remoteStyleElement = styleElementMap.get(styleElement);

    if (remoteStyleElement && remoteStyleElement.parentNode) {
      remoteStyleElement.parentNode.removeChild(remoteStyleElement);
      styleElementMap.delete(styleElement);
    }
  };

  const headElement = document.head;
  const originalAppendChild = headElement.appendChild.bind(headElement);
  const originalInsertBefore = headElement.insertBefore.bind(headElement);
  const originalAppend = headElement.append.bind(headElement);
  const originalPrepend = headElement.prepend.bind(headElement);
  const originalReplaceChild = headElement.replaceChild.bind(headElement);
  const originalRemoveChild = headElement.removeChild.bind(headElement);

  headElement.appendChild = <T extends Node>(child: T): T => {
    const result = originalAppendChild(child);
    if (isStyleElement(child)) {
      trackStyleElement(child as unknown as Element);
    }
    return result;
  };

  headElement.insertBefore = <T extends Node>(
    child: T,
    ref: Node | null,
  ): T => {
    const result = originalInsertBefore(child, ref);
    if (isStyleElement(child)) {
      trackStyleElement(child as unknown as Element);
    }
    return result;
  };

  headElement.append = (...nodes: (Node | string)[]) => {
    originalAppend(...nodes);
    for (const node of nodes) {
      if (isStyleElement(node)) {
        trackStyleElement(node as Element);
      }
    }
  };

  headElement.prepend = (...nodes: (Node | string)[]) => {
    originalPrepend(...nodes);
    for (const node of nodes) {
      if (isStyleElement(node)) {
        trackStyleElement(node as Element);
      }
    }
  };

  headElement.replaceChild = <T extends Node>(
    newChild: Node,
    oldChild: T,
  ): T => {
    const result = originalReplaceChild(newChild, oldChild);
    if (isStyleElement(oldChild)) {
      untrackStyleElement(oldChild as unknown as Element);
    }
    if (isStyleElement(newChild)) {
      trackStyleElement(newChild as unknown as Element);
    }
    return result;
  };

  headElement.removeChild = <T extends Node>(child: T): T => {
    const result = originalRemoveChild(child);
    if (isStyleElement(child)) {
      untrackStyleElement(child as unknown as Element);
    }
    return result;
  };

  const existingStyleElements = Array.from(
    headElement.querySelectorAll('style'),
  );
  for (const styleElement of existingStyleElements) {
    trackStyleElement(styleElement);
  }

  Object.defineProperty(document, 'styleSheets', {
    get: () => [],
    configurable: true,
  });
};

const isStyleElement = (node: Node | string): node is Element => {
  return (
    typeof node !== 'string' &&
    'localName' in node &&
    node.localName === 'style'
  );
};
