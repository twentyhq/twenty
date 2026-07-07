import { ALLOWED_HTML_ELEMENTS } from '@/constants/AllowedHtmlElements';
import { isAriaOrDataAttribute } from '@/remote/utils/isAriaOrDataAttribute';

const ATTRIBUTE_NAME_TO_ELEMENT_PROPERTY_NAME: Record<string, string> = {
  className: 'className',
  class: 'className',

  htmlFor: 'htmlFor',
  for: 'htmlFor',

  tabIndex: 'tabIndex',
  tabindex: 'tabIndex',

  srcDoc: 'srcDoc',
  srcdoc: 'srcDoc',
};

type RemoteElementWithAttributeUpdater = Element &
  Record<string, unknown> & {
    updateRemoteAttribute: (attributeName: string, value?: string) => void;
  };

export const patchRemoteElementAttributes = (): void => {
  for (const allowedHtmlElement of ALLOWED_HTML_ELEMENTS) {
    const elementConstructor = customElements.get(allowedHtmlElement.tag);

    if (!elementConstructor) {
      continue;
    }

    const attributeNamesAlreadySyncedByRemoteDom = new Set<string>(
      (
        elementConstructor as CustomElementConstructor & {
          observedAttributes?: string[];
        }
      ).observedAttributes ?? [],
    );

    const shouldForwardAttributeAcrossBoundary = (
      attributeName: string,
    ): boolean =>
      isAriaOrDataAttribute(attributeName) &&
      !attributeNamesAlreadySyncedByRemoteDom.has(attributeName);

    const originalSetAttribute = elementConstructor.prototype.setAttribute as (
      attributeName: string,
      attributeValue: string,
    ) => void;

    elementConstructor.prototype.setAttribute = function (
      this: RemoteElementWithAttributeUpdater,
      attributeName: string,
      attributeValue: string,
    ) {
      const mappedElementPropertyName =
        ATTRIBUTE_NAME_TO_ELEMENT_PROPERTY_NAME[attributeName];

      if (mappedElementPropertyName) {
        this[mappedElementPropertyName] = attributeValue;

        return;
      }

      originalSetAttribute.call(this, attributeName, attributeValue);

      if (shouldForwardAttributeAcrossBoundary(attributeName)) {
        this.updateRemoteAttribute(attributeName, attributeValue);
      }
    };

    const originalRemoveAttribute = elementConstructor.prototype
      .removeAttribute as (attributeName: string) => void;

    elementConstructor.prototype.removeAttribute = function (
      this: RemoteElementWithAttributeUpdater,
      attributeName: string,
    ) {
      const mappedElementPropertyName =
        ATTRIBUTE_NAME_TO_ELEMENT_PROPERTY_NAME[attributeName];

      if (mappedElementPropertyName) {
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
