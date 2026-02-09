/*
 * _____                    _
 *|_   _|_      _____ _ __ | |_ _   _
 *  | | \ \ /\ / / _ \ '_ \| __| | | | Auto-generated file
 *  | |  \ V  V /  __/ | | | |_| |_| | Any edits to this will be overridden
 *  |_|   \_/\_/ \___|_| |_|\__|\__, |
 *                              |___/
 */

import {
  createRemoteElement,
  RemoteRootElement,
  RemoteFragmentElement,
  type RemoteEvent,
} from '@remote-dom/core/elements';
import { type SerializedEventData } from '../../../sdk/front-component-common/SerializedEventData';

export type HtmlCommonProperties = {
  id?: string;
  className?: string;
  style?: string;
  title?: string;
  tabIndex?: number;
  role?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
  'data-testid'?: string;
};
export type HtmlCommonEvents = {
  click(event: RemoteEvent<SerializedEventData>): void;
  dblclick(event: RemoteEvent<SerializedEventData>): void;
  mousedown(event: RemoteEvent<SerializedEventData>): void;
  mouseup(event: RemoteEvent<SerializedEventData>): void;
  mouseover(event: RemoteEvent<SerializedEventData>): void;
  mouseout(event: RemoteEvent<SerializedEventData>): void;
  mouseenter(event: RemoteEvent<SerializedEventData>): void;
  mouseleave(event: RemoteEvent<SerializedEventData>): void;
  keydown(event: RemoteEvent<SerializedEventData>): void;
  keyup(event: RemoteEvent<SerializedEventData>): void;
  keypress(event: RemoteEvent<SerializedEventData>): void;
  focus(event: RemoteEvent<SerializedEventData>): void;
  blur(event: RemoteEvent<SerializedEventData>): void;
  change(event: RemoteEvent<SerializedEventData>): void;
  input(event: RemoteEvent<SerializedEventData>): void;
  submit(event: RemoteEvent<SerializedEventData>): void;
  scroll(event: RemoteEvent<SerializedEventData>): void;
  wheel(event: RemoteEvent<SerializedEventData>): void;
  contextmenu(event: RemoteEvent<SerializedEventData>): void;
  drag(event: RemoteEvent<SerializedEventData>): void;
};

const HTML_COMMON_EVENTS_ARRAY = [
  'click',
  'dblclick',
  'mousedown',
  'mouseup',
  'mouseover',
  'mouseout',
  'mouseenter',
  'mouseleave',
  'keydown',
  'keyup',
  'keypress',
  'focus',
  'blur',
  'change',
  'input',
  'submit',
  'scroll',
  'wheel',
  'contextmenu',
  'drag',
] as const;
const HTML_COMMON_PROPERTIES_CONFIG = {
  id: { type: String },
  className: { type: String },
  style: { type: String },
  title: { type: String },
  tabIndex: { type: Number },
  role: { type: String },
  'aria-label': { type: String },
  'aria-hidden': { type: Boolean },
  'data-testid': { type: String },
};
export const HtmlDivElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlSpanElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlSectionElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlArticleElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlHeaderElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlFooterElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlMainElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlNavElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlAsideElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlPElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlH1Element = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlH2Element = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlH3Element = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlH4Element = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlH5Element = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlH6Element = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlStrongElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlEmElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlSmallElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlCodeElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlPreElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlBlockquoteElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlAProperties = HtmlCommonProperties & {
  href?: string;
  target?: string;
  rel?: string;
};

export const HtmlAElement = createRemoteElement<
  HtmlAProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    href: { type: String },
    target: { type: String },
    rel: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlImgProperties = HtmlCommonProperties & {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
};

export const HtmlImgElement = createRemoteElement<
  HtmlImgProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    src: { type: String },
    alt: { type: String },
    width: { type: Number },
    height: { type: Number },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlUlElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlOlElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlLiElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlFormProperties = HtmlCommonProperties & {
  action?: string;
  method?: string;
};

export const HtmlFormElement = createRemoteElement<
  HtmlFormProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    action: { type: String },
    method: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlLabelProperties = HtmlCommonProperties & {
  htmlFor?: string;
};

export const HtmlLabelElement = createRemoteElement<
  HtmlLabelProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    htmlFor: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlInputProperties = HtmlCommonProperties & {
  type?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  checked?: boolean;
  readOnly?: boolean;
};

export const HtmlInputElement = createRemoteElement<
  HtmlInputProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    type: { type: String },
    name: { type: String },
    value: { type: String },
    placeholder: { type: String },
    disabled: { type: Boolean },
    checked: { type: Boolean },
    readOnly: { type: Boolean },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlTextareaProperties = HtmlCommonProperties & {
  name?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  rows?: number;
  cols?: number;
};

export const HtmlTextareaElement = createRemoteElement<
  HtmlTextareaProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    name: { type: String },
    value: { type: String },
    placeholder: { type: String },
    disabled: { type: Boolean },
    readOnly: { type: Boolean },
    rows: { type: Number },
    cols: { type: Number },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlSelectProperties = HtmlCommonProperties & {
  name?: string;
  value?: string;
  disabled?: boolean;
  multiple?: boolean;
};

export const HtmlSelectElement = createRemoteElement<
  HtmlSelectProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    name: { type: String },
    value: { type: String },
    disabled: { type: Boolean },
    multiple: { type: Boolean },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlOptionProperties = HtmlCommonProperties & {
  value?: string;
  disabled?: boolean;
  selected?: boolean;
};

export const HtmlOptionElement = createRemoteElement<
  HtmlOptionProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    value: { type: String },
    disabled: { type: Boolean },
    selected: { type: Boolean },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlButtonProperties = HtmlCommonProperties & {
  type?: string;
  disabled?: boolean;
};

export const HtmlButtonElement = createRemoteElement<
  HtmlButtonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    type: { type: String },
    disabled: { type: Boolean },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlTableElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlTheadElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlTbodyElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlTfootElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlTrElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlThProperties = HtmlCommonProperties & {
  colSpan?: number;
  rowSpan?: number;
};

export const HtmlThElement = createRemoteElement<
  HtmlThProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    colSpan: { type: Number },
    rowSpan: { type: Number },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlTdProperties = HtmlCommonProperties & {
  colSpan?: number;
  rowSpan?: number;
};

export const HtmlTdElement = createRemoteElement<
  HtmlTdProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    colSpan: { type: Number },
    rowSpan: { type: Number },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlBrElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlHrElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type TwentyUiButtonProperties = HtmlCommonProperties & {
  variant?: string;
  accent?: string;
  size?: string;
  disabled?: boolean;
  fullWidth?: boolean;
};

export const TwentyUiButtonElement = createRemoteElement<
  TwentyUiButtonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    variant: { type: String },
    accent: { type: String },
    size: { type: String },
    disabled: { type: Boolean },
    fullWidth: { type: Boolean },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
customElements.define('html-div', HtmlDivElement);
customElements.define('html-span', HtmlSpanElement);
customElements.define('html-section', HtmlSectionElement);
customElements.define('html-article', HtmlArticleElement);
customElements.define('html-header', HtmlHeaderElement);
customElements.define('html-footer', HtmlFooterElement);
customElements.define('html-main', HtmlMainElement);
customElements.define('html-nav', HtmlNavElement);
customElements.define('html-aside', HtmlAsideElement);
customElements.define('html-p', HtmlPElement);
customElements.define('html-h1', HtmlH1Element);
customElements.define('html-h2', HtmlH2Element);
customElements.define('html-h3', HtmlH3Element);
customElements.define('html-h4', HtmlH4Element);
customElements.define('html-h5', HtmlH5Element);
customElements.define('html-h6', HtmlH6Element);
customElements.define('html-strong', HtmlStrongElement);
customElements.define('html-em', HtmlEmElement);
customElements.define('html-small', HtmlSmallElement);
customElements.define('html-code', HtmlCodeElement);
customElements.define('html-pre', HtmlPreElement);
customElements.define('html-blockquote', HtmlBlockquoteElement);
customElements.define('html-a', HtmlAElement);
customElements.define('html-img', HtmlImgElement);
customElements.define('html-ul', HtmlUlElement);
customElements.define('html-ol', HtmlOlElement);
customElements.define('html-li', HtmlLiElement);
customElements.define('html-form', HtmlFormElement);
customElements.define('html-label', HtmlLabelElement);
customElements.define('html-input', HtmlInputElement);
customElements.define('html-textarea', HtmlTextareaElement);
customElements.define('html-select', HtmlSelectElement);
customElements.define('html-option', HtmlOptionElement);
customElements.define('html-button', HtmlButtonElement);
customElements.define('html-table', HtmlTableElement);
customElements.define('html-thead', HtmlTheadElement);
customElements.define('html-tbody', HtmlTbodyElement);
customElements.define('html-tfoot', HtmlTfootElement);
customElements.define('html-tr', HtmlTrElement);
customElements.define('html-th', HtmlThElement);
customElements.define('html-td', HtmlTdElement);
customElements.define('html-br', HtmlBrElement);
customElements.define('html-hr', HtmlHrElement);
customElements.define('twenty-ui-button', TwentyUiButtonElement);
customElements.define('remote-root', RemoteRootElement);
customElements.define('remote-fragment', RemoteFragmentElement);

export { RemoteRootElement, RemoteFragmentElement };
declare global {
  interface HTMLElementTagNameMap {
    'html-div': InstanceType<typeof HtmlDivElement>;
    'html-span': InstanceType<typeof HtmlSpanElement>;
    'html-section': InstanceType<typeof HtmlSectionElement>;
    'html-article': InstanceType<typeof HtmlArticleElement>;
    'html-header': InstanceType<typeof HtmlHeaderElement>;
    'html-footer': InstanceType<typeof HtmlFooterElement>;
    'html-main': InstanceType<typeof HtmlMainElement>;
    'html-nav': InstanceType<typeof HtmlNavElement>;
    'html-aside': InstanceType<typeof HtmlAsideElement>;
    'html-p': InstanceType<typeof HtmlPElement>;
    'html-h1': InstanceType<typeof HtmlH1Element>;
    'html-h2': InstanceType<typeof HtmlH2Element>;
    'html-h3': InstanceType<typeof HtmlH3Element>;
    'html-h4': InstanceType<typeof HtmlH4Element>;
    'html-h5': InstanceType<typeof HtmlH5Element>;
    'html-h6': InstanceType<typeof HtmlH6Element>;
    'html-strong': InstanceType<typeof HtmlStrongElement>;
    'html-em': InstanceType<typeof HtmlEmElement>;
    'html-small': InstanceType<typeof HtmlSmallElement>;
    'html-code': InstanceType<typeof HtmlCodeElement>;
    'html-pre': InstanceType<typeof HtmlPreElement>;
    'html-blockquote': InstanceType<typeof HtmlBlockquoteElement>;
    'html-a': InstanceType<typeof HtmlAElement>;
    'html-img': InstanceType<typeof HtmlImgElement>;
    'html-ul': InstanceType<typeof HtmlUlElement>;
    'html-ol': InstanceType<typeof HtmlOlElement>;
    'html-li': InstanceType<typeof HtmlLiElement>;
    'html-form': InstanceType<typeof HtmlFormElement>;
    'html-label': InstanceType<typeof HtmlLabelElement>;
    'html-input': InstanceType<typeof HtmlInputElement>;
    'html-textarea': InstanceType<typeof HtmlTextareaElement>;
    'html-select': InstanceType<typeof HtmlSelectElement>;
    'html-option': InstanceType<typeof HtmlOptionElement>;
    'html-button': InstanceType<typeof HtmlButtonElement>;
    'html-table': InstanceType<typeof HtmlTableElement>;
    'html-thead': InstanceType<typeof HtmlTheadElement>;
    'html-tbody': InstanceType<typeof HtmlTbodyElement>;
    'html-tfoot': InstanceType<typeof HtmlTfootElement>;
    'html-tr': InstanceType<typeof HtmlTrElement>;
    'html-th': InstanceType<typeof HtmlThElement>;
    'html-td': InstanceType<typeof HtmlTdElement>;
    'html-br': InstanceType<typeof HtmlBrElement>;
    'html-hr': InstanceType<typeof HtmlHrElement>;
    'twenty-ui-button': InstanceType<typeof TwentyUiButtonElement>;
    'remote-root': InstanceType<typeof RemoteRootElement>;
    'remote-fragment': InstanceType<typeof RemoteFragmentElement>;
  }
}
