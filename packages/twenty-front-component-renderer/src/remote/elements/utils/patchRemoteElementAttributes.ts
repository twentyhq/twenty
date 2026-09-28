import { type RemoteElementConstructor as RemoteDomElementConstructor } from '@remote-dom/core/elements';
import { isDefined } from 'twenty-shared/utils';

import { ALLOWED_HTML_ELEMENTS } from '@/constants/AllowedHtmlElements';
import { isAriaOrDataAttribute } from '@/remote/elements/utils/isAriaOrDataAttribute';
import { serializeRemotePropertyAsAttributeValue } from '@/remote/elements/utils/serializeRemotePropertyAsAttributeValue';

const PROPERTY_MAPPED_ATTRIBUTES = [
  { attributeName: 'for', elementPropertyName: 'htmlFor' },
  { attributeName: 'tabindex', elementPropertyName: 'tabIndex' },
  { attributeName: 'srcdoc', elementPropertyName: 'srcDoc' },
];

const UNREFLECTED_REMOTE_PROPERTY_NAMES = new Set([
  'className',
  ...PROPERTY_MAPPED_ATTRIBUTES.map(
    ({ elementPropertyName }) => elementPropertyName,
  ),
]);

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
    attributeChangedCallback: (
      attributeName: string,
      oldValue: string | null,
      newValue: string | null,
    ) => void;
    updateRemoteAttribute: (attributeName: string, value?: string) => void;
    updateRemoteProperty: (propertyName: string, value?: unknown) => void;
  };

type RemoteElementConstructor = CustomElementConstructor &
  Partial<Pick<RemoteDomElementConstructor, 'remotePropertyDefinitions'>> & {
    observedAttributes?: string[];
    prototype: RemoteElementWithAttributeUpdater;
  };

type RemotePropertyDefinition = {
  name: string;
  type?: unknown;
  attribute?: string;
};

const readRemotePropertyAsAttributeValue = ({
  element,
  attributeName,
  remotePropertyDefinition,
  readAttributeValueWrittenBySetAttribute,
}: {
  element: RemoteElementWithAttributeUpdater;
  attributeName: string;
  remotePropertyDefinition: RemotePropertyDefinition;
  readAttributeValueWrittenBySetAttribute: (
    attributeName: string,
  ) => string | null;
}): string | null => {
  const propertyValue = element[remotePropertyDefinition.name];
  const serializedValue = serializeRemotePropertyAsAttributeValue({
    attributeName,
    propertyValue,
    hasRemoteDomFalseDefault: remotePropertyDefinition.type === Boolean,
  });
  const isFalseSerializedAsAbsent =
    propertyValue === false && !isDefined(serializedValue);

  if (!isFalseSerializedAsAbsent) {
    return serializedValue;
  }

  const isFalseWrittenBySetAttribute =
    readAttributeValueWrittenBySetAttribute(attributeName) === 'false';

  return isFalseWrittenBySetAttribute ? 'false' : null;
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

    const toCanonicalAttributeName = (attributeName: string): string => {
      if (attributeName === 'className') {
        return 'class';
      }

      if (ATTRIBUTE_NAME_TO_ELEMENT_PROPERTY_NAME.has(attributeName)) {
        return attributeName;
      }

      const remotePropertyAttributeName =
        elementConstructor.remotePropertyDefinitions?.get(
          attributeName,
        )?.attribute;

      return isDefined(remotePropertyAttributeName)
        ? remotePropertyAttributeName
        : attributeName;
    };

    const remotePropertyDefinitionByAttributeName = new Map<
      string,
      RemotePropertyDefinition
    >();

    for (const remotePropertyDefinition of elementConstructor.remotePropertyDefinitions?.values() ??
      []) {
      if (
        isDefined(remotePropertyDefinition.attribute) &&
        !UNREFLECTED_REMOTE_PROPERTY_NAMES.has(remotePropertyDefinition.name)
      ) {
        remotePropertyDefinitionByAttributeName.set(
          remotePropertyDefinition.attribute,
          remotePropertyDefinition,
        );
      }
    }

    const overwriteReflectedRemotePropertyWithAttributeValue = ({
      element,
      attributeName,
      attributeValue,
    }: {
      element: RemoteElementWithAttributeUpdater;
      attributeName: string;
      attributeValue: string | null;
    }): void => {
      if (!remotePropertyDefinitionByAttributeName.has(attributeName)) {
        return;
      }

      element.attributeChangedCallback(attributeName, null, attributeValue);
    };

    const originalGetAttribute = elementConstructor.prototype.getAttribute;

    elementConstructor.prototype.getAttribute = function (
      this: RemoteElementWithAttributeUpdater,
      rawAttributeName: string,
    ) {
      const attributeName = toCanonicalAttributeName(rawAttributeName);
      const mappedElementPropertyName =
        ATTRIBUTE_NAME_TO_ELEMENT_PROPERTY_NAME.get(attributeName);

      if (isDefined(mappedElementPropertyName)) {
        const elementPropertyValue = this[mappedElementPropertyName];

        return isDefined(elementPropertyValue)
          ? String(elementPropertyValue)
          : null;
      }

      const remotePropertyDefinition =
        remotePropertyDefinitionByAttributeName.get(attributeName);

      if (isDefined(remotePropertyDefinition)) {
        return readRemotePropertyAsAttributeValue({
          element: this,
          attributeName,
          remotePropertyDefinition,
          readAttributeValueWrittenBySetAttribute: (writtenAttributeName) =>
            originalGetAttribute.call(this, writtenAttributeName),
        });
      }

      return originalGetAttribute.call(this, attributeName);
    };

    const originalHasAttribute = elementConstructor.prototype.hasAttribute;

    elementConstructor.prototype.hasAttribute = function (
      this: RemoteElementWithAttributeUpdater,
      rawAttributeName: string,
    ) {
      const attributeName = toCanonicalAttributeName(rawAttributeName);
      const mappedElementPropertyName =
        ATTRIBUTE_NAME_TO_ELEMENT_PROPERTY_NAME.get(attributeName);

      if (isDefined(mappedElementPropertyName)) {
        return isDefined(this[mappedElementPropertyName]);
      }

      const remotePropertyDefinition =
        remotePropertyDefinitionByAttributeName.get(attributeName);

      if (isDefined(remotePropertyDefinition)) {
        return isDefined(this.getAttribute(attributeName));
      }

      return originalHasAttribute.call(this, attributeName);
    };

    const originalGetAttributeNames =
      elementConstructor.prototype.getAttributeNames;

    elementConstructor.prototype.getAttributeNames = function (
      this: RemoteElementWithAttributeUpdater,
    ) {
      const isReflectedAttributePresent = (attributeName: string): boolean =>
        isDefined(this.getAttribute(attributeName));
      const storedAttributeNames = originalGetAttributeNames
        .call(this)
        .filter(
          (attributeName: string) =>
            !remotePropertyDefinitionByAttributeName.has(attributeName) ||
            isReflectedAttributePresent(attributeName),
        );
      const reflectedAttributeNames = [
        ...remotePropertyDefinitionByAttributeName.keys(),
      ].filter(
        (attributeName) =>
          !storedAttributeNames.includes(attributeName) &&
          isReflectedAttributePresent(attributeName),
      );
      const mappedAttributeNames = PROPERTY_MAPPED_ATTRIBUTES.filter(
        ({ elementPropertyName }) => isDefined(this[elementPropertyName]),
      ).map(({ attributeName }) => attributeName);

      return [
        ...storedAttributeNames,
        ...reflectedAttributeNames,
        ...mappedAttributeNames,
      ];
    };

    const originalSetAttribute = elementConstructor.prototype.setAttribute;

    elementConstructor.prototype.setAttribute = function (
      this: RemoteElementWithAttributeUpdater,
      rawAttributeName: string,
      attributeValue: string,
    ) {
      const attributeName = toCanonicalAttributeName(rawAttributeName);
      const mappedElementPropertyName =
        ATTRIBUTE_NAME_TO_ELEMENT_PROPERTY_NAME.get(attributeName);

      if (isDefined(mappedElementPropertyName)) {
        this[mappedElementPropertyName] = attributeValue;

        return;
      }

      originalSetAttribute.call(this, attributeName, attributeValue);
      overwriteReflectedRemotePropertyWithAttributeValue({
        element: this,
        attributeName,
        attributeValue,
      });

      if (attributeName === 'class') {
        this.updateRemoteProperty('className', attributeValue);
      }

      if (shouldForwardAttributeAcrossBoundary(attributeName)) {
        this.updateRemoteAttribute(attributeName, attributeValue);
      }
    };

    const originalRemoveAttribute =
      elementConstructor.prototype.removeAttribute;

    elementConstructor.prototype.removeAttribute = function (
      this: RemoteElementWithAttributeUpdater,
      rawAttributeName: string,
    ) {
      const attributeName = toCanonicalAttributeName(rawAttributeName);
      const mappedElementPropertyName =
        ATTRIBUTE_NAME_TO_ELEMENT_PROPERTY_NAME.get(attributeName);

      if (isDefined(mappedElementPropertyName)) {
        this[mappedElementPropertyName] = undefined;

        return;
      }

      originalRemoveAttribute.call(this, attributeName);
      overwriteReflectedRemotePropertyWithAttributeValue({
        element: this,
        attributeName,
        attributeValue: null,
      });

      if (attributeName === 'class') {
        this.updateRemoteProperty('className', undefined);
      }

      if (shouldForwardAttributeAcrossBoundary(attributeName)) {
        this.updateRemoteAttribute(attributeName);
      }
    };
  }
};
