import { createRemoteComponent } from '@remote-dom/react';
import { type ComponentType } from 'react';

import { ALLOWED_HTML_ELEMENTS } from '@/page-layout/widgets/front-component/constants/AllowedHtmlElements';

const EVENT_PROPS = {
  onClick: { event: 'click' },
  onChange: { event: 'change' },
  onSubmit: { event: 'submit' },
  onInput: { event: 'input' },
  onFocus: { event: 'focus' },
  onBlur: { event: 'blur' },
  onKeyDown: { event: 'keydown' },
  onKeyUp: { event: 'keyup' },
  onMouseEnter: { event: 'mouseenter' },
  onMouseLeave: { event: 'mouseleave' },
} as const;

export const createRemoteHtmlComponents = (): Record<
  string,
  ComponentType<Record<string, unknown>>
> => {
  const components: Record<string, ComponentType<Record<string, unknown>>> = {};

  for (const tagName of ALLOWED_HTML_ELEMENTS) {
    components[tagName] = createRemoteComponent(
      tagName as keyof HTMLElementTagNameMap,
      undefined,
      {
        eventProps: EVENT_PROPS,
      },
    ) as ComponentType<Record<string, unknown>>;
  }

  return components;
};
