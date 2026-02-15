import { ALLOWED_HTML_ELEMENTS } from '@/sdk/front-component-api/constants/AllowedHtmlElements';

// React 18 calls setAttribute(propName, value) on custom elements, using
// the original prop name (e.g. 'className') rather than the HTML attribute
// name (e.g. 'class'). Remote DOM maps declared properties to kebab-case
// attributes (className → 'class-name'), which don't match what React sets.
//
// This patch intercepts setAttribute on custom element prototypes and maps
// known React prop names (and their HTML equivalents) to the correct Remote
// DOM property assignments, which triggers serialization to the host.

const ATTRIBUTE_TO_PROPERTY_MAP: Record<string, string> = {
  // React uses the prop name 'className' as the attribute name on custom elements
  className: 'className',
  // Standard HTML attribute equivalent
  class: 'className',

  htmlFor: 'htmlFor',
  for: 'htmlFor',

  tabIndex: 'tabIndex',
  tabindex: 'tabIndex',
};

export const patchRemoteElementSetAttribute = (): void => {
  for (const elementConfig of ALLOWED_HTML_ELEMENTS) {
    const elementConstructor = customElements.get(elementConfig.tag);

    if (!elementConstructor) {
      continue;
    }

    const originalSetAttribute =
      elementConstructor.prototype.setAttribute as (
        name: string,
        value: string,
      ) => void;

    elementConstructor.prototype.setAttribute = function (
      this: Element & Record<string, unknown>,
      name: string,
      value: string,
    ) {
      const propertyName = ATTRIBUTE_TO_PROPERTY_MAP[name];

      if (propertyName) {
        // Set via property to trigger Remote DOM serialization
        this[propertyName] = value;

        return;
      }

      originalSetAttribute.call(this, name, value);
    };
  }
};
