import { type RemoteElementConstructor as RemoteDomElementConstructor } from '@remote-dom/core/elements';
import { isDefined } from 'twenty-shared/utils';

import { ALLOWED_HTML_ELEMENTS } from '@/constants/AllowedHtmlElements';
import { ARIA_ATTRIBUTE_NAMES_ACCEPTING_BOOLEAN_VALUES } from '@/remote/elements/constants/AriaAttributeNamesAcceptingBooleanValues';

type RemoteElementConstructor = CustomElementConstructor &
  Partial<Pick<RemoteDomElementConstructor, 'remotePropertyDefinitions'>>;

const shouldRemoveAriaAttribute = (value: unknown): boolean =>
  !isDefined(value) || value === '';

export const installAriaBooleanPropertyAccessors = (): void => {
  for (const allowedHtmlElement of ALLOWED_HTML_ELEMENTS) {
    const elementConstructor = customElements.get(allowedHtmlElement.tag) as
      | RemoteElementConstructor
      | undefined;

    if (!isDefined(elementConstructor)) {
      continue;
    }

    const { prototype } = elementConstructor;

    const throwOnPrototypeAccess = (accessedObject: unknown): void => {
      if (accessedObject === prototype) {
        throw new TypeError('Illegal invocation');
      }
    };

    for (const attributeName of ARIA_ATTRIBUTE_NAMES_ACCEPTING_BOOLEAN_VALUES) {
      if (elementConstructor.remotePropertyDefinitions?.has(attributeName)) {
        continue;
      }

      Object.defineProperty(prototype, attributeName, {
        get(this: Element) {
          throwOnPrototypeAccess(this);

          return this.getAttribute(attributeName);
        },
        set(this: Element, value: unknown) {
          throwOnPrototypeAccess(this);

          if (shouldRemoveAriaAttribute(value)) {
            this.removeAttribute(attributeName);

            return;
          }

          this.setAttribute(attributeName, String(value));
        },
        configurable: true,
      });
    }
  }
};
