type InstallHtmlElementInheritancePolyfillInput = {
  documentTarget: {
    body: object;
    head: object;
    documentElement: object;
  };
  htmlElementPrototype: object;
};

export const installHtmlElementInheritancePolyfill = ({
  documentTarget,
  htmlElementPrototype,
}: InstallHtmlElementInheritancePolyfillInput): void => {
  for (const element of [
    documentTarget.body,
    documentTarget.head,
    documentTarget.documentElement,
  ]) {
    if (htmlElementPrototype.isPrototypeOf(element)) {
      continue;
    }

    Object.setPrototypeOf(Object.getPrototypeOf(element), htmlElementPrototype);
  }
};
