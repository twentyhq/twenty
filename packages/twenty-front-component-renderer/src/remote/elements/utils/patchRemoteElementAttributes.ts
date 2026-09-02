import { isDefined } from 'twenty-shared/utils';

import { ALLOWED_HTML_ELEMENTS } from '@/constants/AllowedHtmlElements';
import { isAriaOrDataAttribute } from '@/remote/elements/utils/isAriaOrDataAttribute';

const PROPERTY_MAPPED_ATTRIBUTES = [
  { attributeName: 'class', elementPropertyName: 'className' },
  { attributeName: 'for', elementPropertyName: 'htmlFor' },
  { attributeName: 'tabindex', elementPropertyName: 'tabIndex' },
  { attributeName: 'srcdoc', elementPropertyName: 'srcDoc' },
];

const ATTRIBUTE_NAME_TO_ELEMENT_PROPERTY_NAME = new Map<string, string>(
  PROPERTY_MAPPED_ATTRIBUTES.flatMap(
    ({ attributeName, elementPropertyName }): [string, string][] => [
      [attributeName, elementPropertyName],
      [elementPropertyName, elementPropertyName],
    ],
  ),
);

type RemoteElementWithAttributeUpdater = Element &
  Record<string, unknown> & {
    updateRemoteAttribute: (attributeName: string, value?: string) => void;
  };

type RemoteElementConstructor = CustomElementConstructor & {
  observedAttributes?: string[];
  prototype: RemoteElementWithAttributeUpdater;
};

export const patchRemoteElementAttributes = (): void => {
  for (const allowedHtmlElement of ALLOWED_HTML_ELEMENTS) {
    const elementConstructor = customElements.get(allowedHtmlElement.tag) as
      | RemoteElementConstructor
      | undefined;

    if (!isDefined(elementConstructor)) {
      continue;
    }

    const attributeNamesAlreadySyncedByRemoteDom = new Set<string>(
      elementConstructor.observedAttributes ?? [],
    );

    const shouldForwardAttributeAcrossBoundary = (
      attributeName: string,
    ): boolean =>
      isAriaOrDataAttribute(attributeName) &&
      !attributeNamesAlreadySyncedByRemoteDom.has(attributeName);

    const originalGetAttribute = elementConstructor.prototype.getAttribute;

    elementConstructor.prototype.getAttribute = function (
      this: RemoteElementWithAttributeUpdater,
      attributeName: string,
    ) {
      const mappedElementPropertyName =
        ATTRIBUTE_NAME_TO_ELEMENT_PROPERTY_NAME.get(attributeName);

      if (isDefined(mappedElementPropertyName)) {
        const elementPropertyValue = this[mappedElementPropertyName];

        return isDefined(elementPropertyValue)
          ? String(elementPropertyValue)
          : null;
      }

      return originalGetAttribute.call(this, attributeName);
    };

    const originalHasAttribute = elementConstructor.prototype.hasAttribute;

    elementConstructor.prototype.hasAttribute = function (
      this: RemoteElementWithAttributeUpdater,
      attributeName: string,
    ) {
      const mappedElementPropertyName =
        ATTRIBUTE_NAME_TO_ELEMENT_PROPERTY_NAME.get(attributeName);

      if (isDefined(mappedElementPropertyName)) {
        return isDefined(this[mappedElementPropertyName]);
      }

      return originalHasAttribute.call(this, attributeName);
    };

    const originalGetAttributeNames =
      elementConstructor.prototype.getAttributeNames;

    elementConstructor.prototype.getAttributeNames = function (
      this: RemoteElementWithAttributeUpdater,
    ) {
      const mappedAttributeNames = PROPERTY_MAPPED_ATTRIBUTES.filter(
        ({ elementPropertyName }) => isDefined(this[elementPropertyName]),
      ).map(({ attributeName }) => attributeName);

      return [...originalGetAttributeNames.call(this), ...mappedAttributeNames];
    };

    const originalSetAttribute = elementConstructor.prototype.setAttribute;

    elementConstructor.prototype.setAttribute = function (
      this: RemoteElementWithAttributeUpdater,
      attributeName: string,
      attributeValue: string,
    ) {
      const mappedElementPropertyName =
        ATTRIBUTE_NAME_TO_ELEMENT_PROPERTY_NAME.get(attributeName);

      if (isDefined(mappedElementPropertyName)) {
        this[mappedElementPropertyName] = attributeValue;

        return;
      }

      originalSetAttribute.call(this, attributeName, attributeValue);

      if (shouldForwardAttributeAcrossBoundary(attributeName)) {
        this.updateRemoteAttribute(attributeName, attributeValue);
      }
    };

    const originalRemoveAttribute =
      elementConstructor.prototype.removeAttribute;

    elementConstructor.prototype.removeAttribute = function (
      this: RemoteElementWithAttributeUpdater,
      attributeName: string,
    ) {
      const mappedElementPropertyName =
        ATTRIBUTE_NAME_TO_ELEMENT_PROPERTY_NAME.get(attributeName);

      if (isDefined(mappedElementPropertyName)) {
        this[mappedElementPropertyName] = undefined;

        return;
      }

      originalRemoveAttribute.call(this, attributeName);

      if (shouldForwardAttributeAcrossBoundary(attributeName)) {
        this.updateRemoteAttribute(attributeName);
      }
    };
  }
};
