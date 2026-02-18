import { HTML_TAG_TO_CUSTOM_ELEMENT_TAG } from '@/sdk/front-component-api/constants/HtmlTagToRemoteComponent';

// Frameworks like Vue and Svelte call document.createElement /
// document.createElementNS directly instead of going through React's JSX
// runtime. This patch remaps standard HTML tag names (e.g. "div") to their
// remote-dom custom element equivalents (e.g. "html-div") so the host
// component registry can resolve them.
export const patchDocumentCreateElementForRemoteDom = (): void => {
  const originalCreateElement = document.createElement.bind(document);

  document.createElement = ((
    tagName: string,
    options?: ElementCreationOptions,
  ): HTMLElement => {
    const remappedTag =
      HTML_TAG_TO_CUSTOM_ELEMENT_TAG[tagName.toLowerCase()] ?? tagName;

    return originalCreateElement(remappedTag, options);
  }) as typeof document.createElement;

  const originalCreateElementNS = document.createElementNS.bind(document);

  document.createElementNS = ((
    namespaceURI: string | null,
    qualifiedName: string,
    options?: ElementCreationOptions,
  ): Element => {
    const remappedTag =
      HTML_TAG_TO_CUSTOM_ELEMENT_TAG[qualifiedName.toLowerCase()] ??
      qualifiedName;

    return originalCreateElementNS(namespaceURI, remappedTag, options);
  }) as typeof document.createElementNS;
};
