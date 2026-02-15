import { ALLOWED_HTML_ELEMENTS } from '@/sdk/front-component-api/constants/AllowedHtmlElements';

const ATTRIBUTE_TO_PROPERTY_MAP: Record<string, string> = {
  className: 'className',
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

    const originalSetAttribute = elementConstructor.prototype.setAttribute as (
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
        this[propertyName] = value;

        return;
      }

      originalSetAttribute.call(this, name, value);
    };
  }
};
