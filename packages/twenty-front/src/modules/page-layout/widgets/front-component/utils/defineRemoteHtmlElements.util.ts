import { createRemoteElement } from '@remote-dom/core/elements';
import { isDefined } from 'twenty-shared/utils';

import { ALLOWED_HTML_ELEMENTS } from '@/page-layout/widgets/front-component/constants/AllowedHtmlElements';

const REMOTE_EVENTS = {
  click: { property: 'onClick' },
  change: { property: 'onChange' },
  submit: { property: 'onSubmit' },
  input: { property: 'onInput' },
  focus: { property: 'onFocus' },
  blur: { property: 'onBlur' },
  keydown: { property: 'onKeyDown' },
  keyup: { property: 'onKeyUp' },
  mouseenter: { property: 'onMouseEnter' },
  mouseleave: { property: 'onMouseLeave' },
} as const;

export const defineRemoteHtmlElements = () => {
  for (const tagName of ALLOWED_HTML_ELEMENTS) {
    if (isDefined(customElements.get(tagName))) {
      continue;
    }

    const RemoteHtmlElement = createRemoteElement({
      events: REMOTE_EVENTS,
    });

    customElements.define(tagName, RemoteHtmlElement);
  }
};
