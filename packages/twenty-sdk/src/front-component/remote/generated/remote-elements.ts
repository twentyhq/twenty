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

export type TwentyUiAnimatedButtonProperties = {
  className?: string;
  title?: string;
  fullWidth?: boolean;
  variant?: string;
  inverted?: boolean;
  size?: string;
  position?: string;
  accent?: string;
  soon?: boolean;
  justify?: string;
  disabled?: boolean;
  focus?: boolean;
  to?: string;
  target?: string;
  dataTestId?: string;
  hotkeys?: unknown[];
  ariaLabel?: string;
  isLoading?: boolean;
  type?: string;
  dataClickOutsideId?: string;
  dataGloballyPreventClickOutside?: boolean;
  soonLabel?: string;
};

export const TwentyUiAnimatedButtonElement = createRemoteElement<
  TwentyUiAnimatedButtonProperties,
  Record<string, never>,
  { Icon: true; animatedSvg: true },
  { click(event: RemoteEvent<SerializedEventData>): void }
>({
  slots: ['Icon', 'animatedSvg'],
  properties: {
    className: { type: String },
    title: { type: String },
    fullWidth: { type: Boolean },
    variant: { type: String },
    inverted: { type: Boolean },
    size: { type: String },
    position: { type: String },
    accent: { type: String },
    soon: { type: Boolean },
    justify: { type: String },
    disabled: { type: Boolean },
    focus: { type: Boolean },
    to: { type: String },
    target: { type: String },
    dataTestId: { type: String },
    hotkeys: { type: Array },
    ariaLabel: { type: String },
    isLoading: { type: Boolean },
    type: { type: String },
    dataClickOutsideId: { type: String },
    dataGloballyPreventClickOutside: { type: Boolean },
    soonLabel: { type: String },
  },
  events: ['click'],
});

export type TwentyUiAnimatedLightIconButtonProperties = {
  className?: string;
  testId?: string;
  title?: string;
  size?: string;
  accent?: string;
  active?: boolean;
  disabled?: boolean;
  focus?: boolean;
  'aria-label'?: string;
};

export const TwentyUiAnimatedLightIconButtonElement = createRemoteElement<
  TwentyUiAnimatedLightIconButtonProperties,
  Record<string, never>,
  { Icon: true },
  { click(event: RemoteEvent<SerializedEventData>): void }
>({
  slots: ['Icon'],
  properties: {
    className: { type: String },
    testId: { type: String },
    title: { type: String },
    size: { type: String },
    accent: { type: String },
    active: { type: Boolean },
    disabled: { type: Boolean },
    focus: { type: Boolean },
    'aria-label': { type: String },
  },
  events: ['click'],
});

export type TwentyUiButtonProperties = {
  className?: string;
  title?: string;
  fullWidth?: boolean;
  variant?: string;
  inverted?: boolean;
  size?: string;
  position?: string;
  accent?: string;
  soon?: boolean;
  justify?: string;
  disabled?: boolean;
  focus?: boolean;
  to?: string;
  target?: string;
  dataTestId?: string;
  hotkeys?: unknown[];
  ariaLabel?: string;
  isLoading?: boolean;
  type?: string;
  dataClickOutsideId?: string;
  dataGloballyPreventClickOutside?: boolean;
};

export const TwentyUiButtonElement = createRemoteElement<
  TwentyUiButtonProperties,
  Record<string, never>,
  { Icon: true },
  { click(event: RemoteEvent<SerializedEventData>): void }
>({
  slots: ['Icon'],
  properties: {
    className: { type: String },
    title: { type: String },
    fullWidth: { type: Boolean },
    variant: { type: String },
    inverted: { type: Boolean },
    size: { type: String },
    position: { type: String },
    accent: { type: String },
    soon: { type: Boolean },
    justify: { type: String },
    disabled: { type: Boolean },
    focus: { type: Boolean },
    to: { type: String },
    target: { type: String },
    dataTestId: { type: String },
    hotkeys: { type: Array },
    ariaLabel: { type: String },
    isLoading: { type: Boolean },
    type: { type: String },
    dataClickOutsideId: { type: String },
    dataGloballyPreventClickOutside: { type: Boolean },
  },
  events: ['click'],
});

export type TwentyUiButtonGroupProperties = {
  variant?: string;
  size?: string;
  accent?: string;
  className?: string;
  children: unknown[];
};

export const TwentyUiButtonGroupElement = createRemoteElement<
  TwentyUiButtonGroupProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    variant: { type: String },
    size: { type: String },
    accent: { type: String },
    className: { type: String },
    children: { type: Array },
  },
});

export type TwentyUiColorPickerButtonProperties = {
  colorName: string;
  isSelected?: boolean;
};

export const TwentyUiColorPickerButtonElement = createRemoteElement<
  TwentyUiColorPickerButtonProperties,
  Record<string, never>,
  Record<string, never>,
  { click(event: RemoteEvent<SerializedEventData>): void }
>({
  properties: {
    colorName: { type: String },
    isSelected: { type: Boolean },
  },
  events: ['click'],
});

export type TwentyUiFloatingButtonProperties = {
  className?: string;
  title?: string;
  size?: string;
  position?: string;
  applyShadow?: boolean;
  applyBlur?: boolean;
  disabled?: boolean;
  focus?: boolean;
  to?: string;
};

export const TwentyUiFloatingButtonElement = createRemoteElement<
  TwentyUiFloatingButtonProperties,
  Record<string, never>,
  { Icon: true },
  Record<string, never>
>({
  slots: ['Icon'],
  properties: {
    className: { type: String },
    title: { type: String },
    size: { type: String },
    position: { type: String },
    applyShadow: { type: Boolean },
    applyBlur: { type: Boolean },
    disabled: { type: Boolean },
    focus: { type: Boolean },
    to: { type: String },
  },
});

export type TwentyUiFloatingButtonGroupProperties = {
  size?: string;
  children: unknown[];
  className?: string;
};

export const TwentyUiFloatingButtonGroupElement = createRemoteElement<
  TwentyUiFloatingButtonGroupProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    size: { type: String },
    children: { type: Array },
    className: { type: String },
  },
});

export type TwentyUiFloatingIconButtonProperties = {
  className?: string;
  size?: string;
  position?: string;
  applyShadow?: boolean;
  applyBlur?: boolean;
  disabled?: boolean;
  focus?: boolean;
  isActive?: boolean;
};

export const TwentyUiFloatingIconButtonElement = createRemoteElement<
  TwentyUiFloatingIconButtonProperties,
  Record<string, never>,
  { Icon: true },
  { click(event: RemoteEvent<SerializedEventData>): void }
>({
  slots: ['Icon'],
  properties: {
    className: { type: String },
    size: { type: String },
    position: { type: String },
    applyShadow: { type: Boolean },
    applyBlur: { type: Boolean },
    disabled: { type: Boolean },
    focus: { type: Boolean },
    isActive: { type: Boolean },
  },
  events: ['click'],
});

export type TwentyUiFloatingIconButtonGroupProperties = {
  className?: string;
  size?: string;
  iconButtons: unknown[];
};

export const TwentyUiFloatingIconButtonGroupElement = createRemoteElement<
  TwentyUiFloatingIconButtonGroupProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    className: { type: String },
    size: { type: String },
    iconButtons: { type: Array },
  },
});

export type TwentyUiInsideButtonProperties = {
  className?: string;
  disabled?: boolean;
};

export const TwentyUiInsideButtonElement = createRemoteElement<
  TwentyUiInsideButtonProperties,
  Record<string, never>,
  { Icon: true },
  { click(event: RemoteEvent<SerializedEventData>): void }
>({
  slots: ['Icon'],
  properties: {
    className: { type: String },
    disabled: { type: Boolean },
  },
  events: ['click'],
});

export type TwentyUiLightButtonProperties = {
  className?: string;
  title?: string;
  accent?: string;
  active?: boolean;
  disabled?: boolean;
  focus?: boolean;
  type?: string;
};

export const TwentyUiLightButtonElement = createRemoteElement<
  TwentyUiLightButtonProperties,
  Record<string, never>,
  { Icon: true },
  { click(event: RemoteEvent<SerializedEventData>): void }
>({
  slots: ['Icon'],
  properties: {
    className: { type: String },
    title: { type: String },
    accent: { type: String },
    active: { type: Boolean },
    disabled: { type: Boolean },
    focus: { type: Boolean },
    type: { type: String },
  },
  events: ['click'],
});

export type TwentyUiLightIconButtonProperties = {
  className?: string;
  testId?: string;
  title?: string;
  size?: string;
  accent?: string;
  active?: boolean;
  disabled?: boolean;
  focus?: boolean;
  'aria-label'?: string;
};

export const TwentyUiLightIconButtonElement = createRemoteElement<
  TwentyUiLightIconButtonProperties,
  Record<string, never>,
  { Icon: true },
  { click(event: RemoteEvent<SerializedEventData>): void }
>({
  slots: ['Icon'],
  properties: {
    className: { type: String },
    testId: { type: String },
    title: { type: String },
    size: { type: String },
    accent: { type: String },
    active: { type: Boolean },
    disabled: { type: Boolean },
    focus: { type: Boolean },
    'aria-label': { type: String },
  },
  events: ['click'],
});

export type TwentyUiLightIconButtonGroupProperties = {
  className?: string;
  size?: string;
  iconButtons: unknown[];
};

export const TwentyUiLightIconButtonGroupElement = createRemoteElement<
  TwentyUiLightIconButtonGroupProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    className: { type: String },
    size: { type: String },
    iconButtons: { type: Array },
  },
});

export type TwentyUiMainButtonProperties = {
  title: string;
  fullWidth?: boolean;
  width?: number;
  variant?: string;
  soon?: boolean;
  disabled?: boolean;
  form?: string;
  formAction?: string;
  formEncType?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
  name?: string;
  type?: string;
  defaultChecked?: boolean;
  suppressContentEditableWarning?: boolean;
  suppressHydrationWarning?: boolean;
  accessKey?: string;
  autoFocus?: boolean;
  className?: string;
  contentEditable?: string;
  contextMenu?: string;
  dir?: string;
  draggable?: string;
  hidden?: boolean;
  id?: string;
  lang?: string;
  nonce?: string;
  slot?: string;
  spellCheck?: string;
  style?: Record<string, unknown>;
  tabIndex?: number;
  translate?: string;
  radioGroup?: string;
  about?: string;
  content?: string;
  datatype?: string;
  prefix?: string;
  property?: string;
  rel?: string;
  resource?: string;
  rev?: string;
  typeof?: string;
  vocab?: string;
  autoCapitalize?: string;
  autoCorrect?: string;
  autoSave?: string;
  color?: string;
  itemProp?: string;
  itemScope?: boolean;
  itemType?: string;
  itemID?: string;
  itemRef?: string;
  results?: number;
  security?: string;
  unselectable?: string;
  inputMode?: string;
  is?: string;
  'data-tooltip-id'?: string;
  'data-tooltip-place'?: string;
  'data-tooltip-content'?: string;
  'data-tooltip-html'?: string;
  'data-tooltip-variant'?: string;
  'data-tooltip-offset'?: number;
  'data-tooltip-events'?: unknown[];
  'data-tooltip-position-strategy'?: string;
  'data-tooltip-delay-show'?: number;
  'data-tooltip-delay-hide'?: number;
  'data-tooltip-float'?: boolean;
  'data-tooltip-hidden'?: boolean;
  'data-tooltip-class-name'?: string;
  'aria-activedescendant'?: string;
  'aria-atomic'?: string;
  'aria-autocomplete'?: string;
  'aria-braillelabel'?: string;
  'aria-brailleroledescription'?: string;
  'aria-busy'?: string;
  'aria-checked'?: string;
  'aria-colcount'?: number;
  'aria-colindex'?: number;
  'aria-colindextext'?: string;
  'aria-colspan'?: number;
  'aria-controls'?: string;
  'aria-current'?: string;
  'aria-describedby'?: string;
  'aria-description'?: string;
  'aria-details'?: string;
  'aria-disabled'?: string;
  'aria-dropeffect'?: string;
  'aria-errormessage'?: string;
  'aria-expanded'?: string;
  'aria-flowto'?: string;
  'aria-grabbed'?: string;
  'aria-haspopup'?: string;
  'aria-hidden'?: string;
  'aria-invalid'?: string;
  'aria-keyshortcuts'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-level'?: number;
  'aria-live'?: string;
  'aria-modal'?: string;
  'aria-multiline'?: string;
  'aria-multiselectable'?: string;
  'aria-orientation'?: string;
  'aria-owns'?: string;
  'aria-placeholder'?: string;
  'aria-posinset'?: number;
  'aria-pressed'?: string;
  'aria-readonly'?: string;
  'aria-relevant'?: string;
  'aria-required'?: string;
  'aria-roledescription'?: string;
  'aria-rowcount'?: number;
  'aria-rowindex'?: number;
  'aria-rowindextext'?: string;
  'aria-rowspan'?: number;
  'aria-selected'?: string;
  'aria-setsize'?: number;
  'aria-sort'?: string;
  'aria-valuemax'?: number;
  'aria-valuemin'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  dangerouslySetInnerHTML?: Record<string, unknown>;
  onCopy?: (...args: unknown[]) => unknown;
  onCopyCapture?: (...args: unknown[]) => unknown;
  onCut?: (...args: unknown[]) => unknown;
  onCutCapture?: (...args: unknown[]) => unknown;
  onPaste?: (...args: unknown[]) => unknown;
  onPasteCapture?: (...args: unknown[]) => unknown;
  onCompositionEnd?: (...args: unknown[]) => unknown;
  onCompositionEndCapture?: (...args: unknown[]) => unknown;
  onCompositionStart?: (...args: unknown[]) => unknown;
  onCompositionStartCapture?: (...args: unknown[]) => unknown;
  onCompositionUpdate?: (...args: unknown[]) => unknown;
  onCompositionUpdateCapture?: (...args: unknown[]) => unknown;
  onFocus?: (...args: unknown[]) => unknown;
  onFocusCapture?: (...args: unknown[]) => unknown;
  onBlur?: (...args: unknown[]) => unknown;
  onBlurCapture?: (...args: unknown[]) => unknown;
  onChange?: (...args: unknown[]) => unknown;
  onChangeCapture?: (...args: unknown[]) => unknown;
  onBeforeInput?: (...args: unknown[]) => unknown;
  onBeforeInputCapture?: (...args: unknown[]) => unknown;
  onInput?: (...args: unknown[]) => unknown;
  onInputCapture?: (...args: unknown[]) => unknown;
  onReset?: (...args: unknown[]) => unknown;
  onResetCapture?: (...args: unknown[]) => unknown;
  onSubmit?: (...args: unknown[]) => unknown;
  onSubmitCapture?: (...args: unknown[]) => unknown;
  onInvalid?: (...args: unknown[]) => unknown;
  onInvalidCapture?: (...args: unknown[]) => unknown;
  onLoad?: (...args: unknown[]) => unknown;
  onLoadCapture?: (...args: unknown[]) => unknown;
  onError?: (...args: unknown[]) => unknown;
  onErrorCapture?: (...args: unknown[]) => unknown;
  onKeyDown?: (...args: unknown[]) => unknown;
  onKeyDownCapture?: (...args: unknown[]) => unknown;
  onKeyPress?: (...args: unknown[]) => unknown;
  onKeyPressCapture?: (...args: unknown[]) => unknown;
  onKeyUp?: (...args: unknown[]) => unknown;
  onKeyUpCapture?: (...args: unknown[]) => unknown;
  onAbort?: (...args: unknown[]) => unknown;
  onAbortCapture?: (...args: unknown[]) => unknown;
  onCanPlay?: (...args: unknown[]) => unknown;
  onCanPlayCapture?: (...args: unknown[]) => unknown;
  onCanPlayThrough?: (...args: unknown[]) => unknown;
  onCanPlayThroughCapture?: (...args: unknown[]) => unknown;
  onDurationChange?: (...args: unknown[]) => unknown;
  onDurationChangeCapture?: (...args: unknown[]) => unknown;
  onEmptied?: (...args: unknown[]) => unknown;
  onEmptiedCapture?: (...args: unknown[]) => unknown;
  onEncrypted?: (...args: unknown[]) => unknown;
  onEncryptedCapture?: (...args: unknown[]) => unknown;
  onEnded?: (...args: unknown[]) => unknown;
  onEndedCapture?: (...args: unknown[]) => unknown;
  onLoadedData?: (...args: unknown[]) => unknown;
  onLoadedDataCapture?: (...args: unknown[]) => unknown;
  onLoadedMetadata?: (...args: unknown[]) => unknown;
  onLoadedMetadataCapture?: (...args: unknown[]) => unknown;
  onLoadStart?: (...args: unknown[]) => unknown;
  onLoadStartCapture?: (...args: unknown[]) => unknown;
  onPause?: (...args: unknown[]) => unknown;
  onPauseCapture?: (...args: unknown[]) => unknown;
  onPlay?: (...args: unknown[]) => unknown;
  onPlayCapture?: (...args: unknown[]) => unknown;
  onPlaying?: (...args: unknown[]) => unknown;
  onPlayingCapture?: (...args: unknown[]) => unknown;
  onProgress?: (...args: unknown[]) => unknown;
  onProgressCapture?: (...args: unknown[]) => unknown;
  onRateChange?: (...args: unknown[]) => unknown;
  onRateChangeCapture?: (...args: unknown[]) => unknown;
  onResize?: (...args: unknown[]) => unknown;
  onResizeCapture?: (...args: unknown[]) => unknown;
  onSeeked?: (...args: unknown[]) => unknown;
  onSeekedCapture?: (...args: unknown[]) => unknown;
  onSeeking?: (...args: unknown[]) => unknown;
  onSeekingCapture?: (...args: unknown[]) => unknown;
  onStalled?: (...args: unknown[]) => unknown;
  onStalledCapture?: (...args: unknown[]) => unknown;
  onSuspend?: (...args: unknown[]) => unknown;
  onSuspendCapture?: (...args: unknown[]) => unknown;
  onTimeUpdate?: (...args: unknown[]) => unknown;
  onTimeUpdateCapture?: (...args: unknown[]) => unknown;
  onVolumeChange?: (...args: unknown[]) => unknown;
  onVolumeChangeCapture?: (...args: unknown[]) => unknown;
  onWaiting?: (...args: unknown[]) => unknown;
  onWaitingCapture?: (...args: unknown[]) => unknown;
  onAuxClick?: (...args: unknown[]) => unknown;
  onAuxClickCapture?: (...args: unknown[]) => unknown;
  onClick?: (...args: unknown[]) => unknown;
  onClickCapture?: (...args: unknown[]) => unknown;
  onContextMenu?: (...args: unknown[]) => unknown;
  onContextMenuCapture?: (...args: unknown[]) => unknown;
  onDoubleClick?: (...args: unknown[]) => unknown;
  onDoubleClickCapture?: (...args: unknown[]) => unknown;
  onDrag?: (...args: unknown[]) => unknown;
  onDragCapture?: (...args: unknown[]) => unknown;
  onDragEnd?: (...args: unknown[]) => unknown;
  onDragEndCapture?: (...args: unknown[]) => unknown;
  onDragEnter?: (...args: unknown[]) => unknown;
  onDragEnterCapture?: (...args: unknown[]) => unknown;
  onDragExit?: (...args: unknown[]) => unknown;
  onDragExitCapture?: (...args: unknown[]) => unknown;
  onDragLeave?: (...args: unknown[]) => unknown;
  onDragLeaveCapture?: (...args: unknown[]) => unknown;
  onDragOver?: (...args: unknown[]) => unknown;
  onDragOverCapture?: (...args: unknown[]) => unknown;
  onDragStart?: (...args: unknown[]) => unknown;
  onDragStartCapture?: (...args: unknown[]) => unknown;
  onDrop?: (...args: unknown[]) => unknown;
  onDropCapture?: (...args: unknown[]) => unknown;
  onMouseDown?: (...args: unknown[]) => unknown;
  onMouseDownCapture?: (...args: unknown[]) => unknown;
  onMouseEnter?: (...args: unknown[]) => unknown;
  onMouseLeave?: (...args: unknown[]) => unknown;
  onMouseMove?: (...args: unknown[]) => unknown;
  onMouseMoveCapture?: (...args: unknown[]) => unknown;
  onMouseOut?: (...args: unknown[]) => unknown;
  onMouseOutCapture?: (...args: unknown[]) => unknown;
  onMouseOver?: (...args: unknown[]) => unknown;
  onMouseOverCapture?: (...args: unknown[]) => unknown;
  onMouseUp?: (...args: unknown[]) => unknown;
  onMouseUpCapture?: (...args: unknown[]) => unknown;
  onSelect?: (...args: unknown[]) => unknown;
  onSelectCapture?: (...args: unknown[]) => unknown;
  onTouchCancel?: (...args: unknown[]) => unknown;
  onTouchCancelCapture?: (...args: unknown[]) => unknown;
  onTouchEnd?: (...args: unknown[]) => unknown;
  onTouchEndCapture?: (...args: unknown[]) => unknown;
  onTouchMove?: (...args: unknown[]) => unknown;
  onTouchMoveCapture?: (...args: unknown[]) => unknown;
  onTouchStart?: (...args: unknown[]) => unknown;
  onTouchStartCapture?: (...args: unknown[]) => unknown;
  onPointerDown?: (...args: unknown[]) => unknown;
  onPointerDownCapture?: (...args: unknown[]) => unknown;
  onPointerMove?: (...args: unknown[]) => unknown;
  onPointerMoveCapture?: (...args: unknown[]) => unknown;
  onPointerUp?: (...args: unknown[]) => unknown;
  onPointerUpCapture?: (...args: unknown[]) => unknown;
  onPointerCancel?: (...args: unknown[]) => unknown;
  onPointerCancelCapture?: (...args: unknown[]) => unknown;
  onPointerEnter?: (...args: unknown[]) => unknown;
  onPointerLeave?: (...args: unknown[]) => unknown;
  onPointerOver?: (...args: unknown[]) => unknown;
  onPointerOverCapture?: (...args: unknown[]) => unknown;
  onPointerOut?: (...args: unknown[]) => unknown;
  onPointerOutCapture?: (...args: unknown[]) => unknown;
  onGotPointerCapture?: (...args: unknown[]) => unknown;
  onGotPointerCaptureCapture?: (...args: unknown[]) => unknown;
  onLostPointerCapture?: (...args: unknown[]) => unknown;
  onLostPointerCaptureCapture?: (...args: unknown[]) => unknown;
  onScroll?: (...args: unknown[]) => unknown;
  onScrollCapture?: (...args: unknown[]) => unknown;
  onWheel?: (...args: unknown[]) => unknown;
  onWheelCapture?: (...args: unknown[]) => unknown;
  onAnimationStart?: (...args: unknown[]) => unknown;
  onAnimationStartCapture?: (...args: unknown[]) => unknown;
  onAnimationEnd?: (...args: unknown[]) => unknown;
  onAnimationEndCapture?: (...args: unknown[]) => unknown;
  onAnimationIteration?: (...args: unknown[]) => unknown;
  onAnimationIterationCapture?: (...args: unknown[]) => unknown;
  onTransitionEnd?: (...args: unknown[]) => unknown;
  onTransitionEndCapture?: (...args: unknown[]) => unknown;
};

export const TwentyUiMainButtonElement = createRemoteElement<
  TwentyUiMainButtonProperties,
  Record<string, never>,
  { 'data-tooltip-wrapper': true; children: true; Icon: true },
  Record<string, never>
>({
  slots: ['data-tooltip-wrapper', 'children', 'Icon'],
  properties: {
    title: { type: String },
    fullWidth: { type: Boolean },
    width: { type: Number },
    variant: { type: String },
    soon: { type: Boolean },
    disabled: { type: Boolean },
    form: { type: String },
    formAction: { type: String },
    formEncType: { type: String },
    formMethod: { type: String },
    formNoValidate: { type: Boolean },
    formTarget: { type: String },
    name: { type: String },
    type: { type: String },
    defaultChecked: { type: Boolean },
    suppressContentEditableWarning: { type: Boolean },
    suppressHydrationWarning: { type: Boolean },
    accessKey: { type: String },
    autoFocus: { type: Boolean },
    className: { type: String },
    contentEditable: { type: String },
    contextMenu: { type: String },
    dir: { type: String },
    draggable: { type: String },
    hidden: { type: Boolean },
    id: { type: String },
    lang: { type: String },
    nonce: { type: String },
    slot: { type: String },
    spellCheck: { type: String },
    style: { type: Object },
    tabIndex: { type: Number },
    translate: { type: String },
    radioGroup: { type: String },
    about: { type: String },
    content: { type: String },
    datatype: { type: String },
    prefix: { type: String },
    property: { type: String },
    rel: { type: String },
    resource: { type: String },
    rev: { type: String },
    typeof: { type: String },
    vocab: { type: String },
    autoCapitalize: { type: String },
    autoCorrect: { type: String },
    autoSave: { type: String },
    color: { type: String },
    itemProp: { type: String },
    itemScope: { type: Boolean },
    itemType: { type: String },
    itemID: { type: String },
    itemRef: { type: String },
    results: { type: Number },
    security: { type: String },
    unselectable: { type: String },
    inputMode: { type: String },
    is: { type: String },
    'data-tooltip-id': { type: String },
    'data-tooltip-place': { type: String },
    'data-tooltip-content': { type: String },
    'data-tooltip-html': { type: String },
    'data-tooltip-variant': { type: String },
    'data-tooltip-offset': { type: Number },
    'data-tooltip-events': { type: Array },
    'data-tooltip-position-strategy': { type: String },
    'data-tooltip-delay-show': { type: Number },
    'data-tooltip-delay-hide': { type: Number },
    'data-tooltip-float': { type: Boolean },
    'data-tooltip-hidden': { type: Boolean },
    'data-tooltip-class-name': { type: String },
    'aria-activedescendant': { type: String },
    'aria-atomic': { type: String },
    'aria-autocomplete': { type: String },
    'aria-braillelabel': { type: String },
    'aria-brailleroledescription': { type: String },
    'aria-busy': { type: String },
    'aria-checked': { type: String },
    'aria-colcount': { type: Number },
    'aria-colindex': { type: Number },
    'aria-colindextext': { type: String },
    'aria-colspan': { type: Number },
    'aria-controls': { type: String },
    'aria-current': { type: String },
    'aria-describedby': { type: String },
    'aria-description': { type: String },
    'aria-details': { type: String },
    'aria-disabled': { type: String },
    'aria-dropeffect': { type: String },
    'aria-errormessage': { type: String },
    'aria-expanded': { type: String },
    'aria-flowto': { type: String },
    'aria-grabbed': { type: String },
    'aria-haspopup': { type: String },
    'aria-hidden': { type: String },
    'aria-invalid': { type: String },
    'aria-keyshortcuts': { type: String },
    'aria-label': { type: String },
    'aria-labelledby': { type: String },
    'aria-level': { type: Number },
    'aria-live': { type: String },
    'aria-modal': { type: String },
    'aria-multiline': { type: String },
    'aria-multiselectable': { type: String },
    'aria-orientation': { type: String },
    'aria-owns': { type: String },
    'aria-placeholder': { type: String },
    'aria-posinset': { type: Number },
    'aria-pressed': { type: String },
    'aria-readonly': { type: String },
    'aria-relevant': { type: String },
    'aria-required': { type: String },
    'aria-roledescription': { type: String },
    'aria-rowcount': { type: Number },
    'aria-rowindex': { type: Number },
    'aria-rowindextext': { type: String },
    'aria-rowspan': { type: Number },
    'aria-selected': { type: String },
    'aria-setsize': { type: Number },
    'aria-sort': { type: String },
    'aria-valuemax': { type: Number },
    'aria-valuemin': { type: Number },
    'aria-valuenow': { type: Number },
    'aria-valuetext': { type: String },
    dangerouslySetInnerHTML: { type: Object },
    onCopy: { type: Function },
    onCopyCapture: { type: Function },
    onCut: { type: Function },
    onCutCapture: { type: Function },
    onPaste: { type: Function },
    onPasteCapture: { type: Function },
    onCompositionEnd: { type: Function },
    onCompositionEndCapture: { type: Function },
    onCompositionStart: { type: Function },
    onCompositionStartCapture: { type: Function },
    onCompositionUpdate: { type: Function },
    onCompositionUpdateCapture: { type: Function },
    onFocus: { type: Function },
    onFocusCapture: { type: Function },
    onBlur: { type: Function },
    onBlurCapture: { type: Function },
    onChange: { type: Function },
    onChangeCapture: { type: Function },
    onBeforeInput: { type: Function },
    onBeforeInputCapture: { type: Function },
    onInput: { type: Function },
    onInputCapture: { type: Function },
    onReset: { type: Function },
    onResetCapture: { type: Function },
    onSubmit: { type: Function },
    onSubmitCapture: { type: Function },
    onInvalid: { type: Function },
    onInvalidCapture: { type: Function },
    onLoad: { type: Function },
    onLoadCapture: { type: Function },
    onError: { type: Function },
    onErrorCapture: { type: Function },
    onKeyDown: { type: Function },
    onKeyDownCapture: { type: Function },
    onKeyPress: { type: Function },
    onKeyPressCapture: { type: Function },
    onKeyUp: { type: Function },
    onKeyUpCapture: { type: Function },
    onAbort: { type: Function },
    onAbortCapture: { type: Function },
    onCanPlay: { type: Function },
    onCanPlayCapture: { type: Function },
    onCanPlayThrough: { type: Function },
    onCanPlayThroughCapture: { type: Function },
    onDurationChange: { type: Function },
    onDurationChangeCapture: { type: Function },
    onEmptied: { type: Function },
    onEmptiedCapture: { type: Function },
    onEncrypted: { type: Function },
    onEncryptedCapture: { type: Function },
    onEnded: { type: Function },
    onEndedCapture: { type: Function },
    onLoadedData: { type: Function },
    onLoadedDataCapture: { type: Function },
    onLoadedMetadata: { type: Function },
    onLoadedMetadataCapture: { type: Function },
    onLoadStart: { type: Function },
    onLoadStartCapture: { type: Function },
    onPause: { type: Function },
    onPauseCapture: { type: Function },
    onPlay: { type: Function },
    onPlayCapture: { type: Function },
    onPlaying: { type: Function },
    onPlayingCapture: { type: Function },
    onProgress: { type: Function },
    onProgressCapture: { type: Function },
    onRateChange: { type: Function },
    onRateChangeCapture: { type: Function },
    onResize: { type: Function },
    onResizeCapture: { type: Function },
    onSeeked: { type: Function },
    onSeekedCapture: { type: Function },
    onSeeking: { type: Function },
    onSeekingCapture: { type: Function },
    onStalled: { type: Function },
    onStalledCapture: { type: Function },
    onSuspend: { type: Function },
    onSuspendCapture: { type: Function },
    onTimeUpdate: { type: Function },
    onTimeUpdateCapture: { type: Function },
    onVolumeChange: { type: Function },
    onVolumeChangeCapture: { type: Function },
    onWaiting: { type: Function },
    onWaitingCapture: { type: Function },
    onAuxClick: { type: Function },
    onAuxClickCapture: { type: Function },
    onClick: { type: Function },
    onClickCapture: { type: Function },
    onContextMenu: { type: Function },
    onContextMenuCapture: { type: Function },
    onDoubleClick: { type: Function },
    onDoubleClickCapture: { type: Function },
    onDrag: { type: Function },
    onDragCapture: { type: Function },
    onDragEnd: { type: Function },
    onDragEndCapture: { type: Function },
    onDragEnter: { type: Function },
    onDragEnterCapture: { type: Function },
    onDragExit: { type: Function },
    onDragExitCapture: { type: Function },
    onDragLeave: { type: Function },
    onDragLeaveCapture: { type: Function },
    onDragOver: { type: Function },
    onDragOverCapture: { type: Function },
    onDragStart: { type: Function },
    onDragStartCapture: { type: Function },
    onDrop: { type: Function },
    onDropCapture: { type: Function },
    onMouseDown: { type: Function },
    onMouseDownCapture: { type: Function },
    onMouseEnter: { type: Function },
    onMouseLeave: { type: Function },
    onMouseMove: { type: Function },
    onMouseMoveCapture: { type: Function },
    onMouseOut: { type: Function },
    onMouseOutCapture: { type: Function },
    onMouseOver: { type: Function },
    onMouseOverCapture: { type: Function },
    onMouseUp: { type: Function },
    onMouseUpCapture: { type: Function },
    onSelect: { type: Function },
    onSelectCapture: { type: Function },
    onTouchCancel: { type: Function },
    onTouchCancelCapture: { type: Function },
    onTouchEnd: { type: Function },
    onTouchEndCapture: { type: Function },
    onTouchMove: { type: Function },
    onTouchMoveCapture: { type: Function },
    onTouchStart: { type: Function },
    onTouchStartCapture: { type: Function },
    onPointerDown: { type: Function },
    onPointerDownCapture: { type: Function },
    onPointerMove: { type: Function },
    onPointerMoveCapture: { type: Function },
    onPointerUp: { type: Function },
    onPointerUpCapture: { type: Function },
    onPointerCancel: { type: Function },
    onPointerCancelCapture: { type: Function },
    onPointerEnter: { type: Function },
    onPointerLeave: { type: Function },
    onPointerOver: { type: Function },
    onPointerOverCapture: { type: Function },
    onPointerOut: { type: Function },
    onPointerOutCapture: { type: Function },
    onGotPointerCapture: { type: Function },
    onGotPointerCaptureCapture: { type: Function },
    onLostPointerCapture: { type: Function },
    onLostPointerCaptureCapture: { type: Function },
    onScroll: { type: Function },
    onScrollCapture: { type: Function },
    onWheel: { type: Function },
    onWheelCapture: { type: Function },
    onAnimationStart: { type: Function },
    onAnimationStartCapture: { type: Function },
    onAnimationEnd: { type: Function },
    onAnimationEndCapture: { type: Function },
    onAnimationIteration: { type: Function },
    onAnimationIterationCapture: { type: Function },
    onTransitionEnd: { type: Function },
    onTransitionEndCapture: { type: Function },
  },
});

export type TwentyUiRoundedIconButtonProperties = {
  size?: string;
  disabled?: boolean;
  form?: string;
  formAction?: string;
  formEncType?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
  name?: string;
  type?: string;
  defaultChecked?: boolean;
  suppressContentEditableWarning?: boolean;
  suppressHydrationWarning?: boolean;
  accessKey?: string;
  autoFocus?: boolean;
  className?: string;
  contentEditable?: string;
  contextMenu?: string;
  dir?: string;
  draggable?: string;
  hidden?: boolean;
  id?: string;
  lang?: string;
  nonce?: string;
  slot?: string;
  spellCheck?: string;
  style?: Record<string, unknown>;
  tabIndex?: number;
  title?: string;
  translate?: string;
  radioGroup?: string;
  about?: string;
  content?: string;
  datatype?: string;
  prefix?: string;
  property?: string;
  rel?: string;
  resource?: string;
  rev?: string;
  typeof?: string;
  vocab?: string;
  autoCapitalize?: string;
  autoCorrect?: string;
  autoSave?: string;
  color?: string;
  itemProp?: string;
  itemScope?: boolean;
  itemType?: string;
  itemID?: string;
  itemRef?: string;
  results?: number;
  security?: string;
  unselectable?: string;
  inputMode?: string;
  is?: string;
  'data-tooltip-id'?: string;
  'data-tooltip-place'?: string;
  'data-tooltip-content'?: string;
  'data-tooltip-html'?: string;
  'data-tooltip-variant'?: string;
  'data-tooltip-offset'?: number;
  'data-tooltip-events'?: unknown[];
  'data-tooltip-position-strategy'?: string;
  'data-tooltip-delay-show'?: number;
  'data-tooltip-delay-hide'?: number;
  'data-tooltip-float'?: boolean;
  'data-tooltip-hidden'?: boolean;
  'data-tooltip-class-name'?: string;
  'aria-activedescendant'?: string;
  'aria-atomic'?: string;
  'aria-autocomplete'?: string;
  'aria-braillelabel'?: string;
  'aria-brailleroledescription'?: string;
  'aria-busy'?: string;
  'aria-checked'?: string;
  'aria-colcount'?: number;
  'aria-colindex'?: number;
  'aria-colindextext'?: string;
  'aria-colspan'?: number;
  'aria-controls'?: string;
  'aria-current'?: string;
  'aria-describedby'?: string;
  'aria-description'?: string;
  'aria-details'?: string;
  'aria-disabled'?: string;
  'aria-dropeffect'?: string;
  'aria-errormessage'?: string;
  'aria-expanded'?: string;
  'aria-flowto'?: string;
  'aria-grabbed'?: string;
  'aria-haspopup'?: string;
  'aria-hidden'?: string;
  'aria-invalid'?: string;
  'aria-keyshortcuts'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-level'?: number;
  'aria-live'?: string;
  'aria-modal'?: string;
  'aria-multiline'?: string;
  'aria-multiselectable'?: string;
  'aria-orientation'?: string;
  'aria-owns'?: string;
  'aria-placeholder'?: string;
  'aria-posinset'?: number;
  'aria-pressed'?: string;
  'aria-readonly'?: string;
  'aria-relevant'?: string;
  'aria-required'?: string;
  'aria-roledescription'?: string;
  'aria-rowcount'?: number;
  'aria-rowindex'?: number;
  'aria-rowindextext'?: string;
  'aria-rowspan'?: number;
  'aria-selected'?: string;
  'aria-setsize'?: number;
  'aria-sort'?: string;
  'aria-valuemax'?: number;
  'aria-valuemin'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  dangerouslySetInnerHTML?: Record<string, unknown>;
  onCopy?: (...args: unknown[]) => unknown;
  onCopyCapture?: (...args: unknown[]) => unknown;
  onCut?: (...args: unknown[]) => unknown;
  onCutCapture?: (...args: unknown[]) => unknown;
  onPaste?: (...args: unknown[]) => unknown;
  onPasteCapture?: (...args: unknown[]) => unknown;
  onCompositionEnd?: (...args: unknown[]) => unknown;
  onCompositionEndCapture?: (...args: unknown[]) => unknown;
  onCompositionStart?: (...args: unknown[]) => unknown;
  onCompositionStartCapture?: (...args: unknown[]) => unknown;
  onCompositionUpdate?: (...args: unknown[]) => unknown;
  onCompositionUpdateCapture?: (...args: unknown[]) => unknown;
  onFocus?: (...args: unknown[]) => unknown;
  onFocusCapture?: (...args: unknown[]) => unknown;
  onBlur?: (...args: unknown[]) => unknown;
  onBlurCapture?: (...args: unknown[]) => unknown;
  onChange?: (...args: unknown[]) => unknown;
  onChangeCapture?: (...args: unknown[]) => unknown;
  onBeforeInput?: (...args: unknown[]) => unknown;
  onBeforeInputCapture?: (...args: unknown[]) => unknown;
  onInput?: (...args: unknown[]) => unknown;
  onInputCapture?: (...args: unknown[]) => unknown;
  onReset?: (...args: unknown[]) => unknown;
  onResetCapture?: (...args: unknown[]) => unknown;
  onSubmit?: (...args: unknown[]) => unknown;
  onSubmitCapture?: (...args: unknown[]) => unknown;
  onInvalid?: (...args: unknown[]) => unknown;
  onInvalidCapture?: (...args: unknown[]) => unknown;
  onLoad?: (...args: unknown[]) => unknown;
  onLoadCapture?: (...args: unknown[]) => unknown;
  onError?: (...args: unknown[]) => unknown;
  onErrorCapture?: (...args: unknown[]) => unknown;
  onKeyDown?: (...args: unknown[]) => unknown;
  onKeyDownCapture?: (...args: unknown[]) => unknown;
  onKeyPress?: (...args: unknown[]) => unknown;
  onKeyPressCapture?: (...args: unknown[]) => unknown;
  onKeyUp?: (...args: unknown[]) => unknown;
  onKeyUpCapture?: (...args: unknown[]) => unknown;
  onAbort?: (...args: unknown[]) => unknown;
  onAbortCapture?: (...args: unknown[]) => unknown;
  onCanPlay?: (...args: unknown[]) => unknown;
  onCanPlayCapture?: (...args: unknown[]) => unknown;
  onCanPlayThrough?: (...args: unknown[]) => unknown;
  onCanPlayThroughCapture?: (...args: unknown[]) => unknown;
  onDurationChange?: (...args: unknown[]) => unknown;
  onDurationChangeCapture?: (...args: unknown[]) => unknown;
  onEmptied?: (...args: unknown[]) => unknown;
  onEmptiedCapture?: (...args: unknown[]) => unknown;
  onEncrypted?: (...args: unknown[]) => unknown;
  onEncryptedCapture?: (...args: unknown[]) => unknown;
  onEnded?: (...args: unknown[]) => unknown;
  onEndedCapture?: (...args: unknown[]) => unknown;
  onLoadedData?: (...args: unknown[]) => unknown;
  onLoadedDataCapture?: (...args: unknown[]) => unknown;
  onLoadedMetadata?: (...args: unknown[]) => unknown;
  onLoadedMetadataCapture?: (...args: unknown[]) => unknown;
  onLoadStart?: (...args: unknown[]) => unknown;
  onLoadStartCapture?: (...args: unknown[]) => unknown;
  onPause?: (...args: unknown[]) => unknown;
  onPauseCapture?: (...args: unknown[]) => unknown;
  onPlay?: (...args: unknown[]) => unknown;
  onPlayCapture?: (...args: unknown[]) => unknown;
  onPlaying?: (...args: unknown[]) => unknown;
  onPlayingCapture?: (...args: unknown[]) => unknown;
  onProgress?: (...args: unknown[]) => unknown;
  onProgressCapture?: (...args: unknown[]) => unknown;
  onRateChange?: (...args: unknown[]) => unknown;
  onRateChangeCapture?: (...args: unknown[]) => unknown;
  onResize?: (...args: unknown[]) => unknown;
  onResizeCapture?: (...args: unknown[]) => unknown;
  onSeeked?: (...args: unknown[]) => unknown;
  onSeekedCapture?: (...args: unknown[]) => unknown;
  onSeeking?: (...args: unknown[]) => unknown;
  onSeekingCapture?: (...args: unknown[]) => unknown;
  onStalled?: (...args: unknown[]) => unknown;
  onStalledCapture?: (...args: unknown[]) => unknown;
  onSuspend?: (...args: unknown[]) => unknown;
  onSuspendCapture?: (...args: unknown[]) => unknown;
  onTimeUpdate?: (...args: unknown[]) => unknown;
  onTimeUpdateCapture?: (...args: unknown[]) => unknown;
  onVolumeChange?: (...args: unknown[]) => unknown;
  onVolumeChangeCapture?: (...args: unknown[]) => unknown;
  onWaiting?: (...args: unknown[]) => unknown;
  onWaitingCapture?: (...args: unknown[]) => unknown;
  onAuxClick?: (...args: unknown[]) => unknown;
  onAuxClickCapture?: (...args: unknown[]) => unknown;
  onClick?: (...args: unknown[]) => unknown;
  onClickCapture?: (...args: unknown[]) => unknown;
  onContextMenu?: (...args: unknown[]) => unknown;
  onContextMenuCapture?: (...args: unknown[]) => unknown;
  onDoubleClick?: (...args: unknown[]) => unknown;
  onDoubleClickCapture?: (...args: unknown[]) => unknown;
  onDrag?: (...args: unknown[]) => unknown;
  onDragCapture?: (...args: unknown[]) => unknown;
  onDragEnd?: (...args: unknown[]) => unknown;
  onDragEndCapture?: (...args: unknown[]) => unknown;
  onDragEnter?: (...args: unknown[]) => unknown;
  onDragEnterCapture?: (...args: unknown[]) => unknown;
  onDragExit?: (...args: unknown[]) => unknown;
  onDragExitCapture?: (...args: unknown[]) => unknown;
  onDragLeave?: (...args: unknown[]) => unknown;
  onDragLeaveCapture?: (...args: unknown[]) => unknown;
  onDragOver?: (...args: unknown[]) => unknown;
  onDragOverCapture?: (...args: unknown[]) => unknown;
  onDragStart?: (...args: unknown[]) => unknown;
  onDragStartCapture?: (...args: unknown[]) => unknown;
  onDrop?: (...args: unknown[]) => unknown;
  onDropCapture?: (...args: unknown[]) => unknown;
  onMouseDown?: (...args: unknown[]) => unknown;
  onMouseDownCapture?: (...args: unknown[]) => unknown;
  onMouseEnter?: (...args: unknown[]) => unknown;
  onMouseLeave?: (...args: unknown[]) => unknown;
  onMouseMove?: (...args: unknown[]) => unknown;
  onMouseMoveCapture?: (...args: unknown[]) => unknown;
  onMouseOut?: (...args: unknown[]) => unknown;
  onMouseOutCapture?: (...args: unknown[]) => unknown;
  onMouseOver?: (...args: unknown[]) => unknown;
  onMouseOverCapture?: (...args: unknown[]) => unknown;
  onMouseUp?: (...args: unknown[]) => unknown;
  onMouseUpCapture?: (...args: unknown[]) => unknown;
  onSelect?: (...args: unknown[]) => unknown;
  onSelectCapture?: (...args: unknown[]) => unknown;
  onTouchCancel?: (...args: unknown[]) => unknown;
  onTouchCancelCapture?: (...args: unknown[]) => unknown;
  onTouchEnd?: (...args: unknown[]) => unknown;
  onTouchEndCapture?: (...args: unknown[]) => unknown;
  onTouchMove?: (...args: unknown[]) => unknown;
  onTouchMoveCapture?: (...args: unknown[]) => unknown;
  onTouchStart?: (...args: unknown[]) => unknown;
  onTouchStartCapture?: (...args: unknown[]) => unknown;
  onPointerDown?: (...args: unknown[]) => unknown;
  onPointerDownCapture?: (...args: unknown[]) => unknown;
  onPointerMove?: (...args: unknown[]) => unknown;
  onPointerMoveCapture?: (...args: unknown[]) => unknown;
  onPointerUp?: (...args: unknown[]) => unknown;
  onPointerUpCapture?: (...args: unknown[]) => unknown;
  onPointerCancel?: (...args: unknown[]) => unknown;
  onPointerCancelCapture?: (...args: unknown[]) => unknown;
  onPointerEnter?: (...args: unknown[]) => unknown;
  onPointerLeave?: (...args: unknown[]) => unknown;
  onPointerOver?: (...args: unknown[]) => unknown;
  onPointerOverCapture?: (...args: unknown[]) => unknown;
  onPointerOut?: (...args: unknown[]) => unknown;
  onPointerOutCapture?: (...args: unknown[]) => unknown;
  onGotPointerCapture?: (...args: unknown[]) => unknown;
  onGotPointerCaptureCapture?: (...args: unknown[]) => unknown;
  onLostPointerCapture?: (...args: unknown[]) => unknown;
  onLostPointerCaptureCapture?: (...args: unknown[]) => unknown;
  onScroll?: (...args: unknown[]) => unknown;
  onScrollCapture?: (...args: unknown[]) => unknown;
  onWheel?: (...args: unknown[]) => unknown;
  onWheelCapture?: (...args: unknown[]) => unknown;
  onAnimationStart?: (...args: unknown[]) => unknown;
  onAnimationStartCapture?: (...args: unknown[]) => unknown;
  onAnimationEnd?: (...args: unknown[]) => unknown;
  onAnimationEndCapture?: (...args: unknown[]) => unknown;
  onAnimationIteration?: (...args: unknown[]) => unknown;
  onAnimationIterationCapture?: (...args: unknown[]) => unknown;
  onTransitionEnd?: (...args: unknown[]) => unknown;
  onTransitionEndCapture?: (...args: unknown[]) => unknown;
};

export const TwentyUiRoundedIconButtonElement = createRemoteElement<
  TwentyUiRoundedIconButtonProperties,
  Record<string, never>,
  { Icon: true; 'data-tooltip-wrapper': true; children: true },
  Record<string, never>
>({
  slots: ['Icon', 'data-tooltip-wrapper', 'children'],
  properties: {
    size: { type: String },
    disabled: { type: Boolean },
    form: { type: String },
    formAction: { type: String },
    formEncType: { type: String },
    formMethod: { type: String },
    formNoValidate: { type: Boolean },
    formTarget: { type: String },
    name: { type: String },
    type: { type: String },
    defaultChecked: { type: Boolean },
    suppressContentEditableWarning: { type: Boolean },
    suppressHydrationWarning: { type: Boolean },
    accessKey: { type: String },
    autoFocus: { type: Boolean },
    className: { type: String },
    contentEditable: { type: String },
    contextMenu: { type: String },
    dir: { type: String },
    draggable: { type: String },
    hidden: { type: Boolean },
    id: { type: String },
    lang: { type: String },
    nonce: { type: String },
    slot: { type: String },
    spellCheck: { type: String },
    style: { type: Object },
    tabIndex: { type: Number },
    title: { type: String },
    translate: { type: String },
    radioGroup: { type: String },
    about: { type: String },
    content: { type: String },
    datatype: { type: String },
    prefix: { type: String },
    property: { type: String },
    rel: { type: String },
    resource: { type: String },
    rev: { type: String },
    typeof: { type: String },
    vocab: { type: String },
    autoCapitalize: { type: String },
    autoCorrect: { type: String },
    autoSave: { type: String },
    color: { type: String },
    itemProp: { type: String },
    itemScope: { type: Boolean },
    itemType: { type: String },
    itemID: { type: String },
    itemRef: { type: String },
    results: { type: Number },
    security: { type: String },
    unselectable: { type: String },
    inputMode: { type: String },
    is: { type: String },
    'data-tooltip-id': { type: String },
    'data-tooltip-place': { type: String },
    'data-tooltip-content': { type: String },
    'data-tooltip-html': { type: String },
    'data-tooltip-variant': { type: String },
    'data-tooltip-offset': { type: Number },
    'data-tooltip-events': { type: Array },
    'data-tooltip-position-strategy': { type: String },
    'data-tooltip-delay-show': { type: Number },
    'data-tooltip-delay-hide': { type: Number },
    'data-tooltip-float': { type: Boolean },
    'data-tooltip-hidden': { type: Boolean },
    'data-tooltip-class-name': { type: String },
    'aria-activedescendant': { type: String },
    'aria-atomic': { type: String },
    'aria-autocomplete': { type: String },
    'aria-braillelabel': { type: String },
    'aria-brailleroledescription': { type: String },
    'aria-busy': { type: String },
    'aria-checked': { type: String },
    'aria-colcount': { type: Number },
    'aria-colindex': { type: Number },
    'aria-colindextext': { type: String },
    'aria-colspan': { type: Number },
    'aria-controls': { type: String },
    'aria-current': { type: String },
    'aria-describedby': { type: String },
    'aria-description': { type: String },
    'aria-details': { type: String },
    'aria-disabled': { type: String },
    'aria-dropeffect': { type: String },
    'aria-errormessage': { type: String },
    'aria-expanded': { type: String },
    'aria-flowto': { type: String },
    'aria-grabbed': { type: String },
    'aria-haspopup': { type: String },
    'aria-hidden': { type: String },
    'aria-invalid': { type: String },
    'aria-keyshortcuts': { type: String },
    'aria-label': { type: String },
    'aria-labelledby': { type: String },
    'aria-level': { type: Number },
    'aria-live': { type: String },
    'aria-modal': { type: String },
    'aria-multiline': { type: String },
    'aria-multiselectable': { type: String },
    'aria-orientation': { type: String },
    'aria-owns': { type: String },
    'aria-placeholder': { type: String },
    'aria-posinset': { type: Number },
    'aria-pressed': { type: String },
    'aria-readonly': { type: String },
    'aria-relevant': { type: String },
    'aria-required': { type: String },
    'aria-roledescription': { type: String },
    'aria-rowcount': { type: Number },
    'aria-rowindex': { type: Number },
    'aria-rowindextext': { type: String },
    'aria-rowspan': { type: Number },
    'aria-selected': { type: String },
    'aria-setsize': { type: Number },
    'aria-sort': { type: String },
    'aria-valuemax': { type: Number },
    'aria-valuemin': { type: Number },
    'aria-valuenow': { type: Number },
    'aria-valuetext': { type: String },
    dangerouslySetInnerHTML: { type: Object },
    onCopy: { type: Function },
    onCopyCapture: { type: Function },
    onCut: { type: Function },
    onCutCapture: { type: Function },
    onPaste: { type: Function },
    onPasteCapture: { type: Function },
    onCompositionEnd: { type: Function },
    onCompositionEndCapture: { type: Function },
    onCompositionStart: { type: Function },
    onCompositionStartCapture: { type: Function },
    onCompositionUpdate: { type: Function },
    onCompositionUpdateCapture: { type: Function },
    onFocus: { type: Function },
    onFocusCapture: { type: Function },
    onBlur: { type: Function },
    onBlurCapture: { type: Function },
    onChange: { type: Function },
    onChangeCapture: { type: Function },
    onBeforeInput: { type: Function },
    onBeforeInputCapture: { type: Function },
    onInput: { type: Function },
    onInputCapture: { type: Function },
    onReset: { type: Function },
    onResetCapture: { type: Function },
    onSubmit: { type: Function },
    onSubmitCapture: { type: Function },
    onInvalid: { type: Function },
    onInvalidCapture: { type: Function },
    onLoad: { type: Function },
    onLoadCapture: { type: Function },
    onError: { type: Function },
    onErrorCapture: { type: Function },
    onKeyDown: { type: Function },
    onKeyDownCapture: { type: Function },
    onKeyPress: { type: Function },
    onKeyPressCapture: { type: Function },
    onKeyUp: { type: Function },
    onKeyUpCapture: { type: Function },
    onAbort: { type: Function },
    onAbortCapture: { type: Function },
    onCanPlay: { type: Function },
    onCanPlayCapture: { type: Function },
    onCanPlayThrough: { type: Function },
    onCanPlayThroughCapture: { type: Function },
    onDurationChange: { type: Function },
    onDurationChangeCapture: { type: Function },
    onEmptied: { type: Function },
    onEmptiedCapture: { type: Function },
    onEncrypted: { type: Function },
    onEncryptedCapture: { type: Function },
    onEnded: { type: Function },
    onEndedCapture: { type: Function },
    onLoadedData: { type: Function },
    onLoadedDataCapture: { type: Function },
    onLoadedMetadata: { type: Function },
    onLoadedMetadataCapture: { type: Function },
    onLoadStart: { type: Function },
    onLoadStartCapture: { type: Function },
    onPause: { type: Function },
    onPauseCapture: { type: Function },
    onPlay: { type: Function },
    onPlayCapture: { type: Function },
    onPlaying: { type: Function },
    onPlayingCapture: { type: Function },
    onProgress: { type: Function },
    onProgressCapture: { type: Function },
    onRateChange: { type: Function },
    onRateChangeCapture: { type: Function },
    onResize: { type: Function },
    onResizeCapture: { type: Function },
    onSeeked: { type: Function },
    onSeekedCapture: { type: Function },
    onSeeking: { type: Function },
    onSeekingCapture: { type: Function },
    onStalled: { type: Function },
    onStalledCapture: { type: Function },
    onSuspend: { type: Function },
    onSuspendCapture: { type: Function },
    onTimeUpdate: { type: Function },
    onTimeUpdateCapture: { type: Function },
    onVolumeChange: { type: Function },
    onVolumeChangeCapture: { type: Function },
    onWaiting: { type: Function },
    onWaitingCapture: { type: Function },
    onAuxClick: { type: Function },
    onAuxClickCapture: { type: Function },
    onClick: { type: Function },
    onClickCapture: { type: Function },
    onContextMenu: { type: Function },
    onContextMenuCapture: { type: Function },
    onDoubleClick: { type: Function },
    onDoubleClickCapture: { type: Function },
    onDrag: { type: Function },
    onDragCapture: { type: Function },
    onDragEnd: { type: Function },
    onDragEndCapture: { type: Function },
    onDragEnter: { type: Function },
    onDragEnterCapture: { type: Function },
    onDragExit: { type: Function },
    onDragExitCapture: { type: Function },
    onDragLeave: { type: Function },
    onDragLeaveCapture: { type: Function },
    onDragOver: { type: Function },
    onDragOverCapture: { type: Function },
    onDragStart: { type: Function },
    onDragStartCapture: { type: Function },
    onDrop: { type: Function },
    onDropCapture: { type: Function },
    onMouseDown: { type: Function },
    onMouseDownCapture: { type: Function },
    onMouseEnter: { type: Function },
    onMouseLeave: { type: Function },
    onMouseMove: { type: Function },
    onMouseMoveCapture: { type: Function },
    onMouseOut: { type: Function },
    onMouseOutCapture: { type: Function },
    onMouseOver: { type: Function },
    onMouseOverCapture: { type: Function },
    onMouseUp: { type: Function },
    onMouseUpCapture: { type: Function },
    onSelect: { type: Function },
    onSelectCapture: { type: Function },
    onTouchCancel: { type: Function },
    onTouchCancelCapture: { type: Function },
    onTouchEnd: { type: Function },
    onTouchEndCapture: { type: Function },
    onTouchMove: { type: Function },
    onTouchMoveCapture: { type: Function },
    onTouchStart: { type: Function },
    onTouchStartCapture: { type: Function },
    onPointerDown: { type: Function },
    onPointerDownCapture: { type: Function },
    onPointerMove: { type: Function },
    onPointerMoveCapture: { type: Function },
    onPointerUp: { type: Function },
    onPointerUpCapture: { type: Function },
    onPointerCancel: { type: Function },
    onPointerCancelCapture: { type: Function },
    onPointerEnter: { type: Function },
    onPointerLeave: { type: Function },
    onPointerOver: { type: Function },
    onPointerOverCapture: { type: Function },
    onPointerOut: { type: Function },
    onPointerOutCapture: { type: Function },
    onGotPointerCapture: { type: Function },
    onGotPointerCaptureCapture: { type: Function },
    onLostPointerCapture: { type: Function },
    onLostPointerCaptureCapture: { type: Function },
    onScroll: { type: Function },
    onScrollCapture: { type: Function },
    onWheel: { type: Function },
    onWheelCapture: { type: Function },
    onAnimationStart: { type: Function },
    onAnimationStartCapture: { type: Function },
    onAnimationEnd: { type: Function },
    onAnimationEndCapture: { type: Function },
    onAnimationIteration: { type: Function },
    onAnimationIterationCapture: { type: Function },
    onTransitionEnd: { type: Function },
    onTransitionEndCapture: { type: Function },
  },
});

export type TwentyUiTabContentProperties = {
  id: string;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  logo?: string;
  contentSize?: string;
  className?: string;
};

export const TwentyUiTabContentElement = createRemoteElement<
  TwentyUiTabContentProperties,
  Record<string, never>,
  { LeftIcon: true; RightIcon: true; pill: true },
  Record<string, never>
>({
  slots: ['LeftIcon', 'RightIcon', 'pill'],
  properties: {
    id: { type: String },
    active: { type: Boolean },
    disabled: { type: Boolean },
    title: { type: String },
    logo: { type: String },
    contentSize: { type: String },
    className: { type: String },
  },
});

export type TwentyUiTabButtonProperties = {
  id: string;
  active?: boolean;
  disabled?: boolean;
  to?: string;
  className?: string;
  title?: string;
  onClick?: (...args: unknown[]) => unknown;
  logo?: string;
  contentSize?: string;
  disableTestId?: boolean;
};

export const TwentyUiTabButtonElement = createRemoteElement<
  TwentyUiTabButtonProperties,
  Record<string, never>,
  { LeftIcon: true; RightIcon: true; pill: true },
  Record<string, never>
>({
  slots: ['LeftIcon', 'RightIcon', 'pill'],
  properties: {
    id: { type: String },
    active: { type: Boolean },
    disabled: { type: Boolean },
    to: { type: String },
    className: { type: String },
    title: { type: String },
    onClick: { type: Function },
    logo: { type: String },
    contentSize: { type: String },
    disableTestId: { type: Boolean },
  },
});

export type TwentyUiCodeEditorProperties = {
  height?: string;
  value?: string;
  language?: string;
  onMount?: (...args: unknown[]) => unknown;
  onValidate?: (...args: unknown[]) => unknown;
  options?: Record<string, unknown>;
  onChange?: (...args: unknown[]) => unknown;
  setMarkers?: (...args: unknown[]) => unknown;
  variant?: string;
  isLoading?: boolean;
  transparentBackground?: boolean;
};

export const TwentyUiCodeEditorElement = createRemoteElement<
  TwentyUiCodeEditorProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    height: { type: String },
    value: { type: String },
    language: { type: String },
    onMount: { type: Function },
    onValidate: { type: Function },
    options: { type: Object },
    onChange: { type: Function },
    setMarkers: { type: Function },
    variant: { type: String },
    isLoading: { type: Boolean },
    transparentBackground: { type: Boolean },
  },
});

export type TwentyUiCoreEditorHeaderProperties = {
  title?: string;
  leftNodes?: unknown[];
  rightNodes?: unknown[];
};

export const TwentyUiCoreEditorHeaderElement = createRemoteElement<
  TwentyUiCoreEditorHeaderProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    title: { type: String },
    leftNodes: { type: Array },
    rightNodes: { type: Array },
  },
});

export type TwentyUiColorSchemeCardProperties = {
  variant: string;
  selected?: boolean;
  slot?: string;
  style?: Record<string, unknown>;
  title?: string;
  className?: string;
  onClick?: (...args: unknown[]) => unknown;
  color?: string;
  content?: string;
  translate?: string;
  hidden?: boolean;
  'aria-label'?: string;
  defaultChecked?: boolean;
  suppressContentEditableWarning?: boolean;
  suppressHydrationWarning?: boolean;
  accessKey?: string;
  autoFocus?: boolean;
  contentEditable?: string;
  contextMenu?: string;
  dir?: string;
  draggable?: string;
  id?: string;
  lang?: string;
  nonce?: string;
  spellCheck?: string;
  tabIndex?: number;
  radioGroup?: string;
  about?: string;
  datatype?: string;
  prefix?: string;
  property?: string;
  rel?: string;
  resource?: string;
  rev?: string;
  typeof?: string;
  vocab?: string;
  autoCapitalize?: string;
  autoCorrect?: string;
  autoSave?: string;
  itemProp?: string;
  itemScope?: boolean;
  itemType?: string;
  itemID?: string;
  itemRef?: string;
  results?: number;
  security?: string;
  unselectable?: string;
  inputMode?: string;
  is?: string;
  'data-tooltip-id'?: string;
  'data-tooltip-place'?: string;
  'data-tooltip-content'?: string;
  'data-tooltip-html'?: string;
  'data-tooltip-variant'?: string;
  'data-tooltip-offset'?: number;
  'data-tooltip-events'?: unknown[];
  'data-tooltip-position-strategy'?: string;
  'data-tooltip-delay-show'?: number;
  'data-tooltip-delay-hide'?: number;
  'data-tooltip-float'?: boolean;
  'data-tooltip-hidden'?: boolean;
  'data-tooltip-class-name'?: string;
  'aria-activedescendant'?: string;
  'aria-atomic'?: string;
  'aria-autocomplete'?: string;
  'aria-braillelabel'?: string;
  'aria-brailleroledescription'?: string;
  'aria-busy'?: string;
  'aria-checked'?: string;
  'aria-colcount'?: number;
  'aria-colindex'?: number;
  'aria-colindextext'?: string;
  'aria-colspan'?: number;
  'aria-controls'?: string;
  'aria-current'?: string;
  'aria-describedby'?: string;
  'aria-description'?: string;
  'aria-details'?: string;
  'aria-disabled'?: string;
  'aria-dropeffect'?: string;
  'aria-errormessage'?: string;
  'aria-expanded'?: string;
  'aria-flowto'?: string;
  'aria-grabbed'?: string;
  'aria-haspopup'?: string;
  'aria-hidden'?: string;
  'aria-invalid'?: string;
  'aria-keyshortcuts'?: string;
  'aria-labelledby'?: string;
  'aria-level'?: number;
  'aria-live'?: string;
  'aria-modal'?: string;
  'aria-multiline'?: string;
  'aria-multiselectable'?: string;
  'aria-orientation'?: string;
  'aria-owns'?: string;
  'aria-placeholder'?: string;
  'aria-posinset'?: number;
  'aria-pressed'?: string;
  'aria-readonly'?: string;
  'aria-relevant'?: string;
  'aria-required'?: string;
  'aria-roledescription'?: string;
  'aria-rowcount'?: number;
  'aria-rowindex'?: number;
  'aria-rowindextext'?: string;
  'aria-rowspan'?: number;
  'aria-selected'?: string;
  'aria-setsize'?: number;
  'aria-sort'?: string;
  'aria-valuemax'?: number;
  'aria-valuemin'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  dangerouslySetInnerHTML?: Record<string, unknown>;
  onCopy?: (...args: unknown[]) => unknown;
  onCopyCapture?: (...args: unknown[]) => unknown;
  onCut?: (...args: unknown[]) => unknown;
  onCutCapture?: (...args: unknown[]) => unknown;
  onPaste?: (...args: unknown[]) => unknown;
  onPasteCapture?: (...args: unknown[]) => unknown;
  onCompositionEnd?: (...args: unknown[]) => unknown;
  onCompositionEndCapture?: (...args: unknown[]) => unknown;
  onCompositionStart?: (...args: unknown[]) => unknown;
  onCompositionStartCapture?: (...args: unknown[]) => unknown;
  onCompositionUpdate?: (...args: unknown[]) => unknown;
  onCompositionUpdateCapture?: (...args: unknown[]) => unknown;
  onFocus?: (...args: unknown[]) => unknown;
  onFocusCapture?: (...args: unknown[]) => unknown;
  onBlur?: (...args: unknown[]) => unknown;
  onBlurCapture?: (...args: unknown[]) => unknown;
  onChange?: (...args: unknown[]) => unknown;
  onChangeCapture?: (...args: unknown[]) => unknown;
  onBeforeInput?: (...args: unknown[]) => unknown;
  onBeforeInputCapture?: (...args: unknown[]) => unknown;
  onInput?: (...args: unknown[]) => unknown;
  onInputCapture?: (...args: unknown[]) => unknown;
  onReset?: (...args: unknown[]) => unknown;
  onResetCapture?: (...args: unknown[]) => unknown;
  onSubmit?: (...args: unknown[]) => unknown;
  onSubmitCapture?: (...args: unknown[]) => unknown;
  onInvalid?: (...args: unknown[]) => unknown;
  onInvalidCapture?: (...args: unknown[]) => unknown;
  onLoad?: (...args: unknown[]) => unknown;
  onLoadCapture?: (...args: unknown[]) => unknown;
  onError?: (...args: unknown[]) => unknown;
  onErrorCapture?: (...args: unknown[]) => unknown;
  onKeyDown?: (...args: unknown[]) => unknown;
  onKeyDownCapture?: (...args: unknown[]) => unknown;
  onKeyPress?: (...args: unknown[]) => unknown;
  onKeyPressCapture?: (...args: unknown[]) => unknown;
  onKeyUp?: (...args: unknown[]) => unknown;
  onKeyUpCapture?: (...args: unknown[]) => unknown;
  onAbort?: (...args: unknown[]) => unknown;
  onAbortCapture?: (...args: unknown[]) => unknown;
  onCanPlay?: (...args: unknown[]) => unknown;
  onCanPlayCapture?: (...args: unknown[]) => unknown;
  onCanPlayThrough?: (...args: unknown[]) => unknown;
  onCanPlayThroughCapture?: (...args: unknown[]) => unknown;
  onDurationChange?: (...args: unknown[]) => unknown;
  onDurationChangeCapture?: (...args: unknown[]) => unknown;
  onEmptied?: (...args: unknown[]) => unknown;
  onEmptiedCapture?: (...args: unknown[]) => unknown;
  onEncrypted?: (...args: unknown[]) => unknown;
  onEncryptedCapture?: (...args: unknown[]) => unknown;
  onEnded?: (...args: unknown[]) => unknown;
  onEndedCapture?: (...args: unknown[]) => unknown;
  onLoadedData?: (...args: unknown[]) => unknown;
  onLoadedDataCapture?: (...args: unknown[]) => unknown;
  onLoadedMetadata?: (...args: unknown[]) => unknown;
  onLoadedMetadataCapture?: (...args: unknown[]) => unknown;
  onLoadStart?: (...args: unknown[]) => unknown;
  onLoadStartCapture?: (...args: unknown[]) => unknown;
  onPause?: (...args: unknown[]) => unknown;
  onPauseCapture?: (...args: unknown[]) => unknown;
  onPlay?: (...args: unknown[]) => unknown;
  onPlayCapture?: (...args: unknown[]) => unknown;
  onPlaying?: (...args: unknown[]) => unknown;
  onPlayingCapture?: (...args: unknown[]) => unknown;
  onProgress?: (...args: unknown[]) => unknown;
  onProgressCapture?: (...args: unknown[]) => unknown;
  onRateChange?: (...args: unknown[]) => unknown;
  onRateChangeCapture?: (...args: unknown[]) => unknown;
  onResize?: (...args: unknown[]) => unknown;
  onResizeCapture?: (...args: unknown[]) => unknown;
  onSeeked?: (...args: unknown[]) => unknown;
  onSeekedCapture?: (...args: unknown[]) => unknown;
  onSeeking?: (...args: unknown[]) => unknown;
  onSeekingCapture?: (...args: unknown[]) => unknown;
  onStalled?: (...args: unknown[]) => unknown;
  onStalledCapture?: (...args: unknown[]) => unknown;
  onSuspend?: (...args: unknown[]) => unknown;
  onSuspendCapture?: (...args: unknown[]) => unknown;
  onTimeUpdate?: (...args: unknown[]) => unknown;
  onTimeUpdateCapture?: (...args: unknown[]) => unknown;
  onVolumeChange?: (...args: unknown[]) => unknown;
  onVolumeChangeCapture?: (...args: unknown[]) => unknown;
  onWaiting?: (...args: unknown[]) => unknown;
  onWaitingCapture?: (...args: unknown[]) => unknown;
  onAuxClick?: (...args: unknown[]) => unknown;
  onAuxClickCapture?: (...args: unknown[]) => unknown;
  onClickCapture?: (...args: unknown[]) => unknown;
  onContextMenu?: (...args: unknown[]) => unknown;
  onContextMenuCapture?: (...args: unknown[]) => unknown;
  onDoubleClick?: (...args: unknown[]) => unknown;
  onDoubleClickCapture?: (...args: unknown[]) => unknown;
  onDrag?: (...args: unknown[]) => unknown;
  onDragCapture?: (...args: unknown[]) => unknown;
  onDragEnd?: (...args: unknown[]) => unknown;
  onDragEndCapture?: (...args: unknown[]) => unknown;
  onDragEnter?: (...args: unknown[]) => unknown;
  onDragEnterCapture?: (...args: unknown[]) => unknown;
  onDragExit?: (...args: unknown[]) => unknown;
  onDragExitCapture?: (...args: unknown[]) => unknown;
  onDragLeave?: (...args: unknown[]) => unknown;
  onDragLeaveCapture?: (...args: unknown[]) => unknown;
  onDragOver?: (...args: unknown[]) => unknown;
  onDragOverCapture?: (...args: unknown[]) => unknown;
  onDragStart?: (...args: unknown[]) => unknown;
  onDragStartCapture?: (...args: unknown[]) => unknown;
  onDrop?: (...args: unknown[]) => unknown;
  onDropCapture?: (...args: unknown[]) => unknown;
  onMouseDown?: (...args: unknown[]) => unknown;
  onMouseDownCapture?: (...args: unknown[]) => unknown;
  onMouseEnter?: (...args: unknown[]) => unknown;
  onMouseLeave?: (...args: unknown[]) => unknown;
  onMouseMove?: (...args: unknown[]) => unknown;
  onMouseMoveCapture?: (...args: unknown[]) => unknown;
  onMouseOut?: (...args: unknown[]) => unknown;
  onMouseOutCapture?: (...args: unknown[]) => unknown;
  onMouseOver?: (...args: unknown[]) => unknown;
  onMouseOverCapture?: (...args: unknown[]) => unknown;
  onMouseUp?: (...args: unknown[]) => unknown;
  onMouseUpCapture?: (...args: unknown[]) => unknown;
  onSelect?: (...args: unknown[]) => unknown;
  onSelectCapture?: (...args: unknown[]) => unknown;
  onTouchCancel?: (...args: unknown[]) => unknown;
  onTouchCancelCapture?: (...args: unknown[]) => unknown;
  onTouchEnd?: (...args: unknown[]) => unknown;
  onTouchEndCapture?: (...args: unknown[]) => unknown;
  onTouchMove?: (...args: unknown[]) => unknown;
  onTouchMoveCapture?: (...args: unknown[]) => unknown;
  onTouchStart?: (...args: unknown[]) => unknown;
  onTouchStartCapture?: (...args: unknown[]) => unknown;
  onPointerDown?: (...args: unknown[]) => unknown;
  onPointerDownCapture?: (...args: unknown[]) => unknown;
  onPointerMove?: (...args: unknown[]) => unknown;
  onPointerMoveCapture?: (...args: unknown[]) => unknown;
  onPointerUp?: (...args: unknown[]) => unknown;
  onPointerUpCapture?: (...args: unknown[]) => unknown;
  onPointerCancel?: (...args: unknown[]) => unknown;
  onPointerCancelCapture?: (...args: unknown[]) => unknown;
  onPointerEnter?: (...args: unknown[]) => unknown;
  onPointerLeave?: (...args: unknown[]) => unknown;
  onPointerOver?: (...args: unknown[]) => unknown;
  onPointerOverCapture?: (...args: unknown[]) => unknown;
  onPointerOut?: (...args: unknown[]) => unknown;
  onPointerOutCapture?: (...args: unknown[]) => unknown;
  onGotPointerCapture?: (...args: unknown[]) => unknown;
  onGotPointerCaptureCapture?: (...args: unknown[]) => unknown;
  onLostPointerCapture?: (...args: unknown[]) => unknown;
  onLostPointerCaptureCapture?: (...args: unknown[]) => unknown;
  onScroll?: (...args: unknown[]) => unknown;
  onScrollCapture?: (...args: unknown[]) => unknown;
  onWheel?: (...args: unknown[]) => unknown;
  onWheelCapture?: (...args: unknown[]) => unknown;
  onAnimationStart?: (...args: unknown[]) => unknown;
  onAnimationStartCapture?: (...args: unknown[]) => unknown;
  onAnimationEnd?: (...args: unknown[]) => unknown;
  onAnimationEndCapture?: (...args: unknown[]) => unknown;
  onAnimationIteration?: (...args: unknown[]) => unknown;
  onAnimationIterationCapture?: (...args: unknown[]) => unknown;
  onTransitionEnd?: (...args: unknown[]) => unknown;
  onTransitionEndCapture?: (...args: unknown[]) => unknown;
};

export const TwentyUiColorSchemeCardElement = createRemoteElement<
  TwentyUiColorSchemeCardProperties,
  Record<string, never>,
  { children: true; 'data-tooltip-wrapper': true },
  Record<string, never>
>({
  slots: ['children', 'data-tooltip-wrapper'],
  properties: {
    variant: { type: String },
    selected: { type: Boolean },
    slot: { type: String },
    style: { type: Object },
    title: { type: String },
    className: { type: String },
    onClick: { type: Function },
    color: { type: String },
    content: { type: String },
    translate: { type: String },
    hidden: { type: Boolean },
    'aria-label': { type: String },
    defaultChecked: { type: Boolean },
    suppressContentEditableWarning: { type: Boolean },
    suppressHydrationWarning: { type: Boolean },
    accessKey: { type: String },
    autoFocus: { type: Boolean },
    contentEditable: { type: String },
    contextMenu: { type: String },
    dir: { type: String },
    draggable: { type: String },
    id: { type: String },
    lang: { type: String },
    nonce: { type: String },
    spellCheck: { type: String },
    tabIndex: { type: Number },
    radioGroup: { type: String },
    about: { type: String },
    datatype: { type: String },
    prefix: { type: String },
    property: { type: String },
    rel: { type: String },
    resource: { type: String },
    rev: { type: String },
    typeof: { type: String },
    vocab: { type: String },
    autoCapitalize: { type: String },
    autoCorrect: { type: String },
    autoSave: { type: String },
    itemProp: { type: String },
    itemScope: { type: Boolean },
    itemType: { type: String },
    itemID: { type: String },
    itemRef: { type: String },
    results: { type: Number },
    security: { type: String },
    unselectable: { type: String },
    inputMode: { type: String },
    is: { type: String },
    'data-tooltip-id': { type: String },
    'data-tooltip-place': { type: String },
    'data-tooltip-content': { type: String },
    'data-tooltip-html': { type: String },
    'data-tooltip-variant': { type: String },
    'data-tooltip-offset': { type: Number },
    'data-tooltip-events': { type: Array },
    'data-tooltip-position-strategy': { type: String },
    'data-tooltip-delay-show': { type: Number },
    'data-tooltip-delay-hide': { type: Number },
    'data-tooltip-float': { type: Boolean },
    'data-tooltip-hidden': { type: Boolean },
    'data-tooltip-class-name': { type: String },
    'aria-activedescendant': { type: String },
    'aria-atomic': { type: String },
    'aria-autocomplete': { type: String },
    'aria-braillelabel': { type: String },
    'aria-brailleroledescription': { type: String },
    'aria-busy': { type: String },
    'aria-checked': { type: String },
    'aria-colcount': { type: Number },
    'aria-colindex': { type: Number },
    'aria-colindextext': { type: String },
    'aria-colspan': { type: Number },
    'aria-controls': { type: String },
    'aria-current': { type: String },
    'aria-describedby': { type: String },
    'aria-description': { type: String },
    'aria-details': { type: String },
    'aria-disabled': { type: String },
    'aria-dropeffect': { type: String },
    'aria-errormessage': { type: String },
    'aria-expanded': { type: String },
    'aria-flowto': { type: String },
    'aria-grabbed': { type: String },
    'aria-haspopup': { type: String },
    'aria-hidden': { type: String },
    'aria-invalid': { type: String },
    'aria-keyshortcuts': { type: String },
    'aria-labelledby': { type: String },
    'aria-level': { type: Number },
    'aria-live': { type: String },
    'aria-modal': { type: String },
    'aria-multiline': { type: String },
    'aria-multiselectable': { type: String },
    'aria-orientation': { type: String },
    'aria-owns': { type: String },
    'aria-placeholder': { type: String },
    'aria-posinset': { type: Number },
    'aria-pressed': { type: String },
    'aria-readonly': { type: String },
    'aria-relevant': { type: String },
    'aria-required': { type: String },
    'aria-roledescription': { type: String },
    'aria-rowcount': { type: Number },
    'aria-rowindex': { type: Number },
    'aria-rowindextext': { type: String },
    'aria-rowspan': { type: Number },
    'aria-selected': { type: String },
    'aria-setsize': { type: Number },
    'aria-sort': { type: String },
    'aria-valuemax': { type: Number },
    'aria-valuemin': { type: Number },
    'aria-valuenow': { type: Number },
    'aria-valuetext': { type: String },
    dangerouslySetInnerHTML: { type: Object },
    onCopy: { type: Function },
    onCopyCapture: { type: Function },
    onCut: { type: Function },
    onCutCapture: { type: Function },
    onPaste: { type: Function },
    onPasteCapture: { type: Function },
    onCompositionEnd: { type: Function },
    onCompositionEndCapture: { type: Function },
    onCompositionStart: { type: Function },
    onCompositionStartCapture: { type: Function },
    onCompositionUpdate: { type: Function },
    onCompositionUpdateCapture: { type: Function },
    onFocus: { type: Function },
    onFocusCapture: { type: Function },
    onBlur: { type: Function },
    onBlurCapture: { type: Function },
    onChange: { type: Function },
    onChangeCapture: { type: Function },
    onBeforeInput: { type: Function },
    onBeforeInputCapture: { type: Function },
    onInput: { type: Function },
    onInputCapture: { type: Function },
    onReset: { type: Function },
    onResetCapture: { type: Function },
    onSubmit: { type: Function },
    onSubmitCapture: { type: Function },
    onInvalid: { type: Function },
    onInvalidCapture: { type: Function },
    onLoad: { type: Function },
    onLoadCapture: { type: Function },
    onError: { type: Function },
    onErrorCapture: { type: Function },
    onKeyDown: { type: Function },
    onKeyDownCapture: { type: Function },
    onKeyPress: { type: Function },
    onKeyPressCapture: { type: Function },
    onKeyUp: { type: Function },
    onKeyUpCapture: { type: Function },
    onAbort: { type: Function },
    onAbortCapture: { type: Function },
    onCanPlay: { type: Function },
    onCanPlayCapture: { type: Function },
    onCanPlayThrough: { type: Function },
    onCanPlayThroughCapture: { type: Function },
    onDurationChange: { type: Function },
    onDurationChangeCapture: { type: Function },
    onEmptied: { type: Function },
    onEmptiedCapture: { type: Function },
    onEncrypted: { type: Function },
    onEncryptedCapture: { type: Function },
    onEnded: { type: Function },
    onEndedCapture: { type: Function },
    onLoadedData: { type: Function },
    onLoadedDataCapture: { type: Function },
    onLoadedMetadata: { type: Function },
    onLoadedMetadataCapture: { type: Function },
    onLoadStart: { type: Function },
    onLoadStartCapture: { type: Function },
    onPause: { type: Function },
    onPauseCapture: { type: Function },
    onPlay: { type: Function },
    onPlayCapture: { type: Function },
    onPlaying: { type: Function },
    onPlayingCapture: { type: Function },
    onProgress: { type: Function },
    onProgressCapture: { type: Function },
    onRateChange: { type: Function },
    onRateChangeCapture: { type: Function },
    onResize: { type: Function },
    onResizeCapture: { type: Function },
    onSeeked: { type: Function },
    onSeekedCapture: { type: Function },
    onSeeking: { type: Function },
    onSeekingCapture: { type: Function },
    onStalled: { type: Function },
    onStalledCapture: { type: Function },
    onSuspend: { type: Function },
    onSuspendCapture: { type: Function },
    onTimeUpdate: { type: Function },
    onTimeUpdateCapture: { type: Function },
    onVolumeChange: { type: Function },
    onVolumeChangeCapture: { type: Function },
    onWaiting: { type: Function },
    onWaitingCapture: { type: Function },
    onAuxClick: { type: Function },
    onAuxClickCapture: { type: Function },
    onClickCapture: { type: Function },
    onContextMenu: { type: Function },
    onContextMenuCapture: { type: Function },
    onDoubleClick: { type: Function },
    onDoubleClickCapture: { type: Function },
    onDrag: { type: Function },
    onDragCapture: { type: Function },
    onDragEnd: { type: Function },
    onDragEndCapture: { type: Function },
    onDragEnter: { type: Function },
    onDragEnterCapture: { type: Function },
    onDragExit: { type: Function },
    onDragExitCapture: { type: Function },
    onDragLeave: { type: Function },
    onDragLeaveCapture: { type: Function },
    onDragOver: { type: Function },
    onDragOverCapture: { type: Function },
    onDragStart: { type: Function },
    onDragStartCapture: { type: Function },
    onDrop: { type: Function },
    onDropCapture: { type: Function },
    onMouseDown: { type: Function },
    onMouseDownCapture: { type: Function },
    onMouseEnter: { type: Function },
    onMouseLeave: { type: Function },
    onMouseMove: { type: Function },
    onMouseMoveCapture: { type: Function },
    onMouseOut: { type: Function },
    onMouseOutCapture: { type: Function },
    onMouseOver: { type: Function },
    onMouseOverCapture: { type: Function },
    onMouseUp: { type: Function },
    onMouseUpCapture: { type: Function },
    onSelect: { type: Function },
    onSelectCapture: { type: Function },
    onTouchCancel: { type: Function },
    onTouchCancelCapture: { type: Function },
    onTouchEnd: { type: Function },
    onTouchEndCapture: { type: Function },
    onTouchMove: { type: Function },
    onTouchMoveCapture: { type: Function },
    onTouchStart: { type: Function },
    onTouchStartCapture: { type: Function },
    onPointerDown: { type: Function },
    onPointerDownCapture: { type: Function },
    onPointerMove: { type: Function },
    onPointerMoveCapture: { type: Function },
    onPointerUp: { type: Function },
    onPointerUpCapture: { type: Function },
    onPointerCancel: { type: Function },
    onPointerCancelCapture: { type: Function },
    onPointerEnter: { type: Function },
    onPointerLeave: { type: Function },
    onPointerOver: { type: Function },
    onPointerOverCapture: { type: Function },
    onPointerOut: { type: Function },
    onPointerOutCapture: { type: Function },
    onGotPointerCapture: { type: Function },
    onGotPointerCaptureCapture: { type: Function },
    onLostPointerCapture: { type: Function },
    onLostPointerCaptureCapture: { type: Function },
    onScroll: { type: Function },
    onScrollCapture: { type: Function },
    onWheel: { type: Function },
    onWheelCapture: { type: Function },
    onAnimationStart: { type: Function },
    onAnimationStartCapture: { type: Function },
    onAnimationEnd: { type: Function },
    onAnimationEndCapture: { type: Function },
    onAnimationIteration: { type: Function },
    onAnimationIterationCapture: { type: Function },
    onTransitionEnd: { type: Function },
    onTransitionEndCapture: { type: Function },
  },
});

export type TwentyUiColorSchemePickerProperties = {
  value: string;
  className?: string;
  onChange: (...args: unknown[]) => unknown;
  lightLabel: string;
  darkLabel: string;
  systemLabel: string;
};

export const TwentyUiColorSchemePickerElement = createRemoteElement<
  TwentyUiColorSchemePickerProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    value: { type: String },
    className: { type: String },
    onChange: { type: Function },
    lightLabel: { type: String },
    darkLabel: { type: String },
    systemLabel: { type: String },
  },
});

export type TwentyUiCardPickerProperties = {
  handleChange?: (...args: unknown[]) => unknown;
  checked?: boolean;
};

export const TwentyUiCardPickerElement = createRemoteElement<
  TwentyUiCardPickerProperties,
  Record<string, never>,
  { children: true },
  Record<string, never>
>({
  slots: ['children'],
  properties: {
    handleChange: { type: Function },
    checked: { type: Boolean },
  },
});

export type TwentyUiCheckboxProperties = {
  checked: boolean;
  indeterminate?: boolean;
  hoverable?: boolean;
  onCheckedChange?: (...args: unknown[]) => unknown;
  variant?: string;
  size?: string;
  shape?: string;
  className?: string;
  disabled?: boolean;
  accent?: string;
};

export const TwentyUiCheckboxElement = createRemoteElement<
  TwentyUiCheckboxProperties,
  Record<string, never>,
  Record<string, never>,
  { change(event: RemoteEvent<SerializedEventData>): void }
>({
  properties: {
    checked: { type: Boolean },
    indeterminate: { type: Boolean },
    hoverable: { type: Boolean },
    onCheckedChange: { type: Function },
    variant: { type: String },
    size: { type: String },
    shape: { type: String },
    className: { type: String },
    disabled: { type: Boolean },
    accent: { type: String },
  },
  events: ['change'],
});

export type TwentyUiRadioProperties = {
  checked?: boolean;
  className?: string;
  name?: string;
  disabled?: boolean;
  label?: string;
  labelPosition?: string;
  onCheckedChange?: (...args: unknown[]) => unknown;
  size?: string;
  style?: Record<string, unknown>;
  value?: string;
};

export const TwentyUiRadioElement = createRemoteElement<
  TwentyUiRadioProperties,
  Record<string, never>,
  Record<string, never>,
  { change(event: RemoteEvent<SerializedEventData>): void }
>({
  properties: {
    checked: { type: Boolean },
    className: { type: String },
    name: { type: String },
    disabled: { type: Boolean },
    label: { type: String },
    labelPosition: { type: String },
    onCheckedChange: { type: Function },
    size: { type: String },
    style: { type: Object },
    value: { type: String },
  },
  events: ['change'],
});

export type TwentyUiRadioGroupProperties = {
  value?: string;
  onValueChange?: (...args: unknown[]) => unknown;
};

export const TwentyUiRadioGroupElement = createRemoteElement<
  TwentyUiRadioGroupProperties,
  Record<string, never>,
  { children: true },
  { change(event: RemoteEvent<SerializedEventData>): void }
>({
  slots: ['children'],
  properties: {
    value: { type: String },
    onValueChange: { type: Function },
  },
  events: ['change'],
});

export type TwentyUiSearchInputProperties = {
  value: string;
  onChange: (...args: unknown[]) => unknown;
  placeholder?: string;
  filterDropdown?: (...args: unknown[]) => unknown;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
};

export const TwentyUiSearchInputElement = createRemoteElement<
  TwentyUiSearchInputProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    value: { type: String },
    onChange: { type: Function },
    placeholder: { type: String },
    filterDropdown: { type: Function },
    autoFocus: { type: Boolean },
    disabled: { type: Boolean },
    className: { type: String },
  },
});

export type TwentyUiToggleProperties = {
  id?: string;
  value?: boolean;
  onChange?: (...args: unknown[]) => unknown;
  color?: string;
  toggleSize?: string;
  className?: string;
  disabled?: boolean;
};

export const TwentyUiToggleElement = createRemoteElement<
  TwentyUiToggleProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    id: { type: String },
    value: { type: Boolean },
    onChange: { type: Function },
    color: { type: String },
    toggleSize: { type: String },
    className: { type: String },
    disabled: { type: Boolean },
  },
});

export type TwentyUiAvatarChipProperties = {
  placeholder?: string;
  avatarUrl?: string;
  avatarType?: string;
  IconColor?: string;
  IconBackgroundColor?: string;
  isIconInverted?: boolean;
  placeholderColorSeed?: string;
  divider?: string;
  onClick?: (...args: unknown[]) => unknown;
};

export const TwentyUiAvatarChipElement = createRemoteElement<
  TwentyUiAvatarChipProperties,
  Record<string, never>,
  { Icon: true },
  Record<string, never>
>({
  slots: ['Icon'],
  properties: {
    placeholder: { type: String },
    avatarUrl: { type: String },
    avatarType: { type: String },
    IconColor: { type: String },
    IconBackgroundColor: { type: String },
    isIconInverted: { type: Boolean },
    placeholderColorSeed: { type: String },
    divider: { type: String },
    onClick: { type: Function },
  },
});

export type TwentyUiMultipleAvatarChipProperties = {
  Icons: unknown[];
  text?: string;
  onClick?: (...args: unknown[]) => unknown;
  testId?: string;
  maxWidth?: number;
  forceEmptyText?: boolean;
  variant?: string;
  emptyLabel?: string;
};

export const TwentyUiMultipleAvatarChipElement = createRemoteElement<
  TwentyUiMultipleAvatarChipProperties,
  Record<string, never>,
  { rightComponent: true },
  Record<string, never>
>({
  slots: ['rightComponent'],
  properties: {
    Icons: { type: Array },
    text: { type: String },
    onClick: { type: Function },
    testId: { type: String },
    maxWidth: { type: Number },
    forceEmptyText: { type: Boolean },
    variant: { type: String },
    emptyLabel: { type: String },
  },
});

export type TwentyUiChipProperties = {
  size?: string;
  disabled?: boolean;
  clickable?: boolean;
  label: string;
  isLabelHidden?: boolean;
  maxWidth?: number;
  variant?: string;
  accent?: string;
  className?: string;
  forceEmptyText?: boolean;
  emptyLabel?: string;
};

export const TwentyUiChipElement = createRemoteElement<
  TwentyUiChipProperties,
  Record<string, never>,
  { leftComponent: true; rightComponent: true },
  Record<string, never>
>({
  slots: ['leftComponent', 'rightComponent'],
  properties: {
    size: { type: String },
    disabled: { type: Boolean },
    clickable: { type: Boolean },
    label: { type: String },
    isLabelHidden: { type: Boolean },
    maxWidth: { type: Number },
    variant: { type: String },
    accent: { type: String },
    className: { type: String },
    forceEmptyText: { type: Boolean },
    emptyLabel: { type: String },
  },
});

export type TwentyUiLinkChipProperties = {
  label: string;
  className?: string;
  variant?: string;
  size?: string;
  accent?: string;
  maxWidth?: number;
  forceEmptyText?: boolean;
  emptyLabel?: string;
  isLabelHidden?: boolean;
  to: string;
  triggerEvent?: string;
  target?: string;
};

export const TwentyUiLinkChipElement = createRemoteElement<
  TwentyUiLinkChipProperties,
  Record<string, never>,
  { rightComponent: true; leftComponent: true },
  {
    click(event: RemoteEvent<SerializedEventData>): void;
    mousedown(event: RemoteEvent<SerializedEventData>): void;
  }
>({
  slots: ['rightComponent', 'leftComponent'],
  properties: {
    label: { type: String },
    className: { type: String },
    variant: { type: String },
    size: { type: String },
    accent: { type: String },
    maxWidth: { type: Number },
    forceEmptyText: { type: Boolean },
    emptyLabel: { type: String },
    isLabelHidden: { type: Boolean },
    to: { type: String },
    triggerEvent: { type: String },
    target: { type: String },
  },
  events: ['click', 'mousedown'],
});

export type TwentyUiPillProperties = {
  className?: string;
  label?: string;
};

export const TwentyUiPillElement = createRemoteElement<
  TwentyUiPillProperties,
  Record<string, never>,
  { Icon: true },
  Record<string, never>
>({
  slots: ['Icon'],
  properties: {
    className: { type: String },
    label: { type: String },
  },
});

export type TwentyUiTagProperties = {
  className?: string;
  color: string;
  text: string;
  onClick?: (...args: unknown[]) => unknown;
  weight?: string;
  variant?: string;
  preventShrink?: boolean;
  preventPadding?: boolean;
};

export const TwentyUiTagElement = createRemoteElement<
  TwentyUiTagProperties,
  Record<string, never>,
  { Icon: true },
  Record<string, never>
>({
  slots: ['Icon'],
  properties: {
    className: { type: String },
    color: { type: String },
    text: { type: String },
    onClick: { type: Function },
    weight: { type: String },
    variant: { type: String },
    preventShrink: { type: Boolean },
    preventPadding: { type: Boolean },
  },
});

export type TwentyUiAvatarProperties = {
  avatarUrl?: string;
  className?: string;
  size?: string;
  placeholder?: string;
  placeholderColorSeed?: string;
  iconColor?: string;
  type?: string;
  color?: string;
  backgroundColor?: string;
  onClick?: (...args: unknown[]) => unknown;
};

export const TwentyUiAvatarElement = createRemoteElement<
  TwentyUiAvatarProperties,
  Record<string, never>,
  { Icon: true },
  Record<string, never>
>({
  slots: ['Icon'],
  properties: {
    avatarUrl: { type: String },
    className: { type: String },
    size: { type: String },
    placeholder: { type: String },
    placeholderColorSeed: { type: String },
    iconColor: { type: String },
    type: { type: String },
    color: { type: String },
    backgroundColor: { type: String },
    onClick: { type: Function },
  },
});

export type TwentyUiAvatarGroupProperties = {
  avatars: unknown[];
};

export const TwentyUiAvatarGroupElement = createRemoteElement<
  TwentyUiAvatarGroupProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    avatars: { type: Array },
  },
});

export type TwentyUiBannerProperties = {
  variant?: string;
  className?: string;
  defaultChecked?: boolean;
  suppressContentEditableWarning?: boolean;
  suppressHydrationWarning?: boolean;
  accessKey?: string;
  autoFocus?: boolean;
  contentEditable?: string;
  contextMenu?: string;
  dir?: string;
  draggable?: string;
  hidden?: boolean;
  id?: string;
  lang?: string;
  nonce?: string;
  slot?: string;
  spellCheck?: string;
  style?: Record<string, unknown>;
  tabIndex?: number;
  title?: string;
  translate?: string;
  radioGroup?: string;
  about?: string;
  content?: string;
  datatype?: string;
  prefix?: string;
  property?: string;
  rel?: string;
  resource?: string;
  rev?: string;
  typeof?: string;
  vocab?: string;
  autoCapitalize?: string;
  autoCorrect?: string;
  autoSave?: string;
  color?: string;
  itemProp?: string;
  itemScope?: boolean;
  itemType?: string;
  itemID?: string;
  itemRef?: string;
  results?: number;
  security?: string;
  unselectable?: string;
  inputMode?: string;
  is?: string;
  'data-tooltip-id'?: string;
  'data-tooltip-place'?: string;
  'data-tooltip-content'?: string;
  'data-tooltip-html'?: string;
  'data-tooltip-variant'?: string;
  'data-tooltip-offset'?: number;
  'data-tooltip-events'?: unknown[];
  'data-tooltip-position-strategy'?: string;
  'data-tooltip-delay-show'?: number;
  'data-tooltip-delay-hide'?: number;
  'data-tooltip-float'?: boolean;
  'data-tooltip-hidden'?: boolean;
  'data-tooltip-class-name'?: string;
  'aria-activedescendant'?: string;
  'aria-atomic'?: string;
  'aria-autocomplete'?: string;
  'aria-braillelabel'?: string;
  'aria-brailleroledescription'?: string;
  'aria-busy'?: string;
  'aria-checked'?: string;
  'aria-colcount'?: number;
  'aria-colindex'?: number;
  'aria-colindextext'?: string;
  'aria-colspan'?: number;
  'aria-controls'?: string;
  'aria-current'?: string;
  'aria-describedby'?: string;
  'aria-description'?: string;
  'aria-details'?: string;
  'aria-disabled'?: string;
  'aria-dropeffect'?: string;
  'aria-errormessage'?: string;
  'aria-expanded'?: string;
  'aria-flowto'?: string;
  'aria-grabbed'?: string;
  'aria-haspopup'?: string;
  'aria-hidden'?: string;
  'aria-invalid'?: string;
  'aria-keyshortcuts'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-level'?: number;
  'aria-live'?: string;
  'aria-modal'?: string;
  'aria-multiline'?: string;
  'aria-multiselectable'?: string;
  'aria-orientation'?: string;
  'aria-owns'?: string;
  'aria-placeholder'?: string;
  'aria-posinset'?: number;
  'aria-pressed'?: string;
  'aria-readonly'?: string;
  'aria-relevant'?: string;
  'aria-required'?: string;
  'aria-roledescription'?: string;
  'aria-rowcount'?: number;
  'aria-rowindex'?: number;
  'aria-rowindextext'?: string;
  'aria-rowspan'?: number;
  'aria-selected'?: string;
  'aria-setsize'?: number;
  'aria-sort'?: string;
  'aria-valuemax'?: number;
  'aria-valuemin'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  dangerouslySetInnerHTML?: Record<string, unknown>;
  onCopy?: (...args: unknown[]) => unknown;
  onCopyCapture?: (...args: unknown[]) => unknown;
  onCut?: (...args: unknown[]) => unknown;
  onCutCapture?: (...args: unknown[]) => unknown;
  onPaste?: (...args: unknown[]) => unknown;
  onPasteCapture?: (...args: unknown[]) => unknown;
  onCompositionEnd?: (...args: unknown[]) => unknown;
  onCompositionEndCapture?: (...args: unknown[]) => unknown;
  onCompositionStart?: (...args: unknown[]) => unknown;
  onCompositionStartCapture?: (...args: unknown[]) => unknown;
  onCompositionUpdate?: (...args: unknown[]) => unknown;
  onCompositionUpdateCapture?: (...args: unknown[]) => unknown;
  onFocus?: (...args: unknown[]) => unknown;
  onFocusCapture?: (...args: unknown[]) => unknown;
  onBlur?: (...args: unknown[]) => unknown;
  onBlurCapture?: (...args: unknown[]) => unknown;
  onChange?: (...args: unknown[]) => unknown;
  onChangeCapture?: (...args: unknown[]) => unknown;
  onBeforeInput?: (...args: unknown[]) => unknown;
  onBeforeInputCapture?: (...args: unknown[]) => unknown;
  onInput?: (...args: unknown[]) => unknown;
  onInputCapture?: (...args: unknown[]) => unknown;
  onReset?: (...args: unknown[]) => unknown;
  onResetCapture?: (...args: unknown[]) => unknown;
  onSubmit?: (...args: unknown[]) => unknown;
  onSubmitCapture?: (...args: unknown[]) => unknown;
  onInvalid?: (...args: unknown[]) => unknown;
  onInvalidCapture?: (...args: unknown[]) => unknown;
  onLoad?: (...args: unknown[]) => unknown;
  onLoadCapture?: (...args: unknown[]) => unknown;
  onError?: (...args: unknown[]) => unknown;
  onErrorCapture?: (...args: unknown[]) => unknown;
  onKeyDown?: (...args: unknown[]) => unknown;
  onKeyDownCapture?: (...args: unknown[]) => unknown;
  onKeyPress?: (...args: unknown[]) => unknown;
  onKeyPressCapture?: (...args: unknown[]) => unknown;
  onKeyUp?: (...args: unknown[]) => unknown;
  onKeyUpCapture?: (...args: unknown[]) => unknown;
  onAbort?: (...args: unknown[]) => unknown;
  onAbortCapture?: (...args: unknown[]) => unknown;
  onCanPlay?: (...args: unknown[]) => unknown;
  onCanPlayCapture?: (...args: unknown[]) => unknown;
  onCanPlayThrough?: (...args: unknown[]) => unknown;
  onCanPlayThroughCapture?: (...args: unknown[]) => unknown;
  onDurationChange?: (...args: unknown[]) => unknown;
  onDurationChangeCapture?: (...args: unknown[]) => unknown;
  onEmptied?: (...args: unknown[]) => unknown;
  onEmptiedCapture?: (...args: unknown[]) => unknown;
  onEncrypted?: (...args: unknown[]) => unknown;
  onEncryptedCapture?: (...args: unknown[]) => unknown;
  onEnded?: (...args: unknown[]) => unknown;
  onEndedCapture?: (...args: unknown[]) => unknown;
  onLoadedData?: (...args: unknown[]) => unknown;
  onLoadedDataCapture?: (...args: unknown[]) => unknown;
  onLoadedMetadata?: (...args: unknown[]) => unknown;
  onLoadedMetadataCapture?: (...args: unknown[]) => unknown;
  onLoadStart?: (...args: unknown[]) => unknown;
  onLoadStartCapture?: (...args: unknown[]) => unknown;
  onPause?: (...args: unknown[]) => unknown;
  onPauseCapture?: (...args: unknown[]) => unknown;
  onPlay?: (...args: unknown[]) => unknown;
  onPlayCapture?: (...args: unknown[]) => unknown;
  onPlaying?: (...args: unknown[]) => unknown;
  onPlayingCapture?: (...args: unknown[]) => unknown;
  onProgress?: (...args: unknown[]) => unknown;
  onProgressCapture?: (...args: unknown[]) => unknown;
  onRateChange?: (...args: unknown[]) => unknown;
  onRateChangeCapture?: (...args: unknown[]) => unknown;
  onResize?: (...args: unknown[]) => unknown;
  onResizeCapture?: (...args: unknown[]) => unknown;
  onSeeked?: (...args: unknown[]) => unknown;
  onSeekedCapture?: (...args: unknown[]) => unknown;
  onSeeking?: (...args: unknown[]) => unknown;
  onSeekingCapture?: (...args: unknown[]) => unknown;
  onStalled?: (...args: unknown[]) => unknown;
  onStalledCapture?: (...args: unknown[]) => unknown;
  onSuspend?: (...args: unknown[]) => unknown;
  onSuspendCapture?: (...args: unknown[]) => unknown;
  onTimeUpdate?: (...args: unknown[]) => unknown;
  onTimeUpdateCapture?: (...args: unknown[]) => unknown;
  onVolumeChange?: (...args: unknown[]) => unknown;
  onVolumeChangeCapture?: (...args: unknown[]) => unknown;
  onWaiting?: (...args: unknown[]) => unknown;
  onWaitingCapture?: (...args: unknown[]) => unknown;
  onAuxClick?: (...args: unknown[]) => unknown;
  onAuxClickCapture?: (...args: unknown[]) => unknown;
  onClick?: (...args: unknown[]) => unknown;
  onClickCapture?: (...args: unknown[]) => unknown;
  onContextMenu?: (...args: unknown[]) => unknown;
  onContextMenuCapture?: (...args: unknown[]) => unknown;
  onDoubleClick?: (...args: unknown[]) => unknown;
  onDoubleClickCapture?: (...args: unknown[]) => unknown;
  onDrag?: (...args: unknown[]) => unknown;
  onDragCapture?: (...args: unknown[]) => unknown;
  onDragEnd?: (...args: unknown[]) => unknown;
  onDragEndCapture?: (...args: unknown[]) => unknown;
  onDragEnter?: (...args: unknown[]) => unknown;
  onDragEnterCapture?: (...args: unknown[]) => unknown;
  onDragExit?: (...args: unknown[]) => unknown;
  onDragExitCapture?: (...args: unknown[]) => unknown;
  onDragLeave?: (...args: unknown[]) => unknown;
  onDragLeaveCapture?: (...args: unknown[]) => unknown;
  onDragOver?: (...args: unknown[]) => unknown;
  onDragOverCapture?: (...args: unknown[]) => unknown;
  onDragStart?: (...args: unknown[]) => unknown;
  onDragStartCapture?: (...args: unknown[]) => unknown;
  onDrop?: (...args: unknown[]) => unknown;
  onDropCapture?: (...args: unknown[]) => unknown;
  onMouseDown?: (...args: unknown[]) => unknown;
  onMouseDownCapture?: (...args: unknown[]) => unknown;
  onMouseEnter?: (...args: unknown[]) => unknown;
  onMouseLeave?: (...args: unknown[]) => unknown;
  onMouseMove?: (...args: unknown[]) => unknown;
  onMouseMoveCapture?: (...args: unknown[]) => unknown;
  onMouseOut?: (...args: unknown[]) => unknown;
  onMouseOutCapture?: (...args: unknown[]) => unknown;
  onMouseOver?: (...args: unknown[]) => unknown;
  onMouseOverCapture?: (...args: unknown[]) => unknown;
  onMouseUp?: (...args: unknown[]) => unknown;
  onMouseUpCapture?: (...args: unknown[]) => unknown;
  onSelect?: (...args: unknown[]) => unknown;
  onSelectCapture?: (...args: unknown[]) => unknown;
  onTouchCancel?: (...args: unknown[]) => unknown;
  onTouchCancelCapture?: (...args: unknown[]) => unknown;
  onTouchEnd?: (...args: unknown[]) => unknown;
  onTouchEndCapture?: (...args: unknown[]) => unknown;
  onTouchMove?: (...args: unknown[]) => unknown;
  onTouchMoveCapture?: (...args: unknown[]) => unknown;
  onTouchStart?: (...args: unknown[]) => unknown;
  onTouchStartCapture?: (...args: unknown[]) => unknown;
  onPointerDown?: (...args: unknown[]) => unknown;
  onPointerDownCapture?: (...args: unknown[]) => unknown;
  onPointerMove?: (...args: unknown[]) => unknown;
  onPointerMoveCapture?: (...args: unknown[]) => unknown;
  onPointerUp?: (...args: unknown[]) => unknown;
  onPointerUpCapture?: (...args: unknown[]) => unknown;
  onPointerCancel?: (...args: unknown[]) => unknown;
  onPointerCancelCapture?: (...args: unknown[]) => unknown;
  onPointerEnter?: (...args: unknown[]) => unknown;
  onPointerLeave?: (...args: unknown[]) => unknown;
  onPointerOver?: (...args: unknown[]) => unknown;
  onPointerOverCapture?: (...args: unknown[]) => unknown;
  onPointerOut?: (...args: unknown[]) => unknown;
  onPointerOutCapture?: (...args: unknown[]) => unknown;
  onGotPointerCapture?: (...args: unknown[]) => unknown;
  onGotPointerCaptureCapture?: (...args: unknown[]) => unknown;
  onLostPointerCapture?: (...args: unknown[]) => unknown;
  onLostPointerCaptureCapture?: (...args: unknown[]) => unknown;
  onScroll?: (...args: unknown[]) => unknown;
  onScrollCapture?: (...args: unknown[]) => unknown;
  onWheel?: (...args: unknown[]) => unknown;
  onWheelCapture?: (...args: unknown[]) => unknown;
  onAnimationStart?: (...args: unknown[]) => unknown;
  onAnimationStartCapture?: (...args: unknown[]) => unknown;
  onAnimationEnd?: (...args: unknown[]) => unknown;
  onAnimationEndCapture?: (...args: unknown[]) => unknown;
  onAnimationIteration?: (...args: unknown[]) => unknown;
  onAnimationIterationCapture?: (...args: unknown[]) => unknown;
  onTransitionEnd?: (...args: unknown[]) => unknown;
  onTransitionEndCapture?: (...args: unknown[]) => unknown;
};

export const TwentyUiBannerElement = createRemoteElement<
  TwentyUiBannerProperties,
  Record<string, never>,
  { children: true; 'data-tooltip-wrapper': true },
  Record<string, never>
>({
  slots: ['children', 'data-tooltip-wrapper'],
  properties: {
    variant: { type: String },
    className: { type: String },
    defaultChecked: { type: Boolean },
    suppressContentEditableWarning: { type: Boolean },
    suppressHydrationWarning: { type: Boolean },
    accessKey: { type: String },
    autoFocus: { type: Boolean },
    contentEditable: { type: String },
    contextMenu: { type: String },
    dir: { type: String },
    draggable: { type: String },
    hidden: { type: Boolean },
    id: { type: String },
    lang: { type: String },
    nonce: { type: String },
    slot: { type: String },
    spellCheck: { type: String },
    style: { type: Object },
    tabIndex: { type: Number },
    title: { type: String },
    translate: { type: String },
    radioGroup: { type: String },
    about: { type: String },
    content: { type: String },
    datatype: { type: String },
    prefix: { type: String },
    property: { type: String },
    rel: { type: String },
    resource: { type: String },
    rev: { type: String },
    typeof: { type: String },
    vocab: { type: String },
    autoCapitalize: { type: String },
    autoCorrect: { type: String },
    autoSave: { type: String },
    color: { type: String },
    itemProp: { type: String },
    itemScope: { type: Boolean },
    itemType: { type: String },
    itemID: { type: String },
    itemRef: { type: String },
    results: { type: Number },
    security: { type: String },
    unselectable: { type: String },
    inputMode: { type: String },
    is: { type: String },
    'data-tooltip-id': { type: String },
    'data-tooltip-place': { type: String },
    'data-tooltip-content': { type: String },
    'data-tooltip-html': { type: String },
    'data-tooltip-variant': { type: String },
    'data-tooltip-offset': { type: Number },
    'data-tooltip-events': { type: Array },
    'data-tooltip-position-strategy': { type: String },
    'data-tooltip-delay-show': { type: Number },
    'data-tooltip-delay-hide': { type: Number },
    'data-tooltip-float': { type: Boolean },
    'data-tooltip-hidden': { type: Boolean },
    'data-tooltip-class-name': { type: String },
    'aria-activedescendant': { type: String },
    'aria-atomic': { type: String },
    'aria-autocomplete': { type: String },
    'aria-braillelabel': { type: String },
    'aria-brailleroledescription': { type: String },
    'aria-busy': { type: String },
    'aria-checked': { type: String },
    'aria-colcount': { type: Number },
    'aria-colindex': { type: Number },
    'aria-colindextext': { type: String },
    'aria-colspan': { type: Number },
    'aria-controls': { type: String },
    'aria-current': { type: String },
    'aria-describedby': { type: String },
    'aria-description': { type: String },
    'aria-details': { type: String },
    'aria-disabled': { type: String },
    'aria-dropeffect': { type: String },
    'aria-errormessage': { type: String },
    'aria-expanded': { type: String },
    'aria-flowto': { type: String },
    'aria-grabbed': { type: String },
    'aria-haspopup': { type: String },
    'aria-hidden': { type: String },
    'aria-invalid': { type: String },
    'aria-keyshortcuts': { type: String },
    'aria-label': { type: String },
    'aria-labelledby': { type: String },
    'aria-level': { type: Number },
    'aria-live': { type: String },
    'aria-modal': { type: String },
    'aria-multiline': { type: String },
    'aria-multiselectable': { type: String },
    'aria-orientation': { type: String },
    'aria-owns': { type: String },
    'aria-placeholder': { type: String },
    'aria-posinset': { type: Number },
    'aria-pressed': { type: String },
    'aria-readonly': { type: String },
    'aria-relevant': { type: String },
    'aria-required': { type: String },
    'aria-roledescription': { type: String },
    'aria-rowcount': { type: Number },
    'aria-rowindex': { type: Number },
    'aria-rowindextext': { type: String },
    'aria-rowspan': { type: Number },
    'aria-selected': { type: String },
    'aria-setsize': { type: Number },
    'aria-sort': { type: String },
    'aria-valuemax': { type: Number },
    'aria-valuemin': { type: Number },
    'aria-valuenow': { type: Number },
    'aria-valuetext': { type: String },
    dangerouslySetInnerHTML: { type: Object },
    onCopy: { type: Function },
    onCopyCapture: { type: Function },
    onCut: { type: Function },
    onCutCapture: { type: Function },
    onPaste: { type: Function },
    onPasteCapture: { type: Function },
    onCompositionEnd: { type: Function },
    onCompositionEndCapture: { type: Function },
    onCompositionStart: { type: Function },
    onCompositionStartCapture: { type: Function },
    onCompositionUpdate: { type: Function },
    onCompositionUpdateCapture: { type: Function },
    onFocus: { type: Function },
    onFocusCapture: { type: Function },
    onBlur: { type: Function },
    onBlurCapture: { type: Function },
    onChange: { type: Function },
    onChangeCapture: { type: Function },
    onBeforeInput: { type: Function },
    onBeforeInputCapture: { type: Function },
    onInput: { type: Function },
    onInputCapture: { type: Function },
    onReset: { type: Function },
    onResetCapture: { type: Function },
    onSubmit: { type: Function },
    onSubmitCapture: { type: Function },
    onInvalid: { type: Function },
    onInvalidCapture: { type: Function },
    onLoad: { type: Function },
    onLoadCapture: { type: Function },
    onError: { type: Function },
    onErrorCapture: { type: Function },
    onKeyDown: { type: Function },
    onKeyDownCapture: { type: Function },
    onKeyPress: { type: Function },
    onKeyPressCapture: { type: Function },
    onKeyUp: { type: Function },
    onKeyUpCapture: { type: Function },
    onAbort: { type: Function },
    onAbortCapture: { type: Function },
    onCanPlay: { type: Function },
    onCanPlayCapture: { type: Function },
    onCanPlayThrough: { type: Function },
    onCanPlayThroughCapture: { type: Function },
    onDurationChange: { type: Function },
    onDurationChangeCapture: { type: Function },
    onEmptied: { type: Function },
    onEmptiedCapture: { type: Function },
    onEncrypted: { type: Function },
    onEncryptedCapture: { type: Function },
    onEnded: { type: Function },
    onEndedCapture: { type: Function },
    onLoadedData: { type: Function },
    onLoadedDataCapture: { type: Function },
    onLoadedMetadata: { type: Function },
    onLoadedMetadataCapture: { type: Function },
    onLoadStart: { type: Function },
    onLoadStartCapture: { type: Function },
    onPause: { type: Function },
    onPauseCapture: { type: Function },
    onPlay: { type: Function },
    onPlayCapture: { type: Function },
    onPlaying: { type: Function },
    onPlayingCapture: { type: Function },
    onProgress: { type: Function },
    onProgressCapture: { type: Function },
    onRateChange: { type: Function },
    onRateChangeCapture: { type: Function },
    onResize: { type: Function },
    onResizeCapture: { type: Function },
    onSeeked: { type: Function },
    onSeekedCapture: { type: Function },
    onSeeking: { type: Function },
    onSeekingCapture: { type: Function },
    onStalled: { type: Function },
    onStalledCapture: { type: Function },
    onSuspend: { type: Function },
    onSuspendCapture: { type: Function },
    onTimeUpdate: { type: Function },
    onTimeUpdateCapture: { type: Function },
    onVolumeChange: { type: Function },
    onVolumeChangeCapture: { type: Function },
    onWaiting: { type: Function },
    onWaitingCapture: { type: Function },
    onAuxClick: { type: Function },
    onAuxClickCapture: { type: Function },
    onClick: { type: Function },
    onClickCapture: { type: Function },
    onContextMenu: { type: Function },
    onContextMenuCapture: { type: Function },
    onDoubleClick: { type: Function },
    onDoubleClickCapture: { type: Function },
    onDrag: { type: Function },
    onDragCapture: { type: Function },
    onDragEnd: { type: Function },
    onDragEndCapture: { type: Function },
    onDragEnter: { type: Function },
    onDragEnterCapture: { type: Function },
    onDragExit: { type: Function },
    onDragExitCapture: { type: Function },
    onDragLeave: { type: Function },
    onDragLeaveCapture: { type: Function },
    onDragOver: { type: Function },
    onDragOverCapture: { type: Function },
    onDragStart: { type: Function },
    onDragStartCapture: { type: Function },
    onDrop: { type: Function },
    onDropCapture: { type: Function },
    onMouseDown: { type: Function },
    onMouseDownCapture: { type: Function },
    onMouseEnter: { type: Function },
    onMouseLeave: { type: Function },
    onMouseMove: { type: Function },
    onMouseMoveCapture: { type: Function },
    onMouseOut: { type: Function },
    onMouseOutCapture: { type: Function },
    onMouseOver: { type: Function },
    onMouseOverCapture: { type: Function },
    onMouseUp: { type: Function },
    onMouseUpCapture: { type: Function },
    onSelect: { type: Function },
    onSelectCapture: { type: Function },
    onTouchCancel: { type: Function },
    onTouchCancelCapture: { type: Function },
    onTouchEnd: { type: Function },
    onTouchEndCapture: { type: Function },
    onTouchMove: { type: Function },
    onTouchMoveCapture: { type: Function },
    onTouchStart: { type: Function },
    onTouchStartCapture: { type: Function },
    onPointerDown: { type: Function },
    onPointerDownCapture: { type: Function },
    onPointerMove: { type: Function },
    onPointerMoveCapture: { type: Function },
    onPointerUp: { type: Function },
    onPointerUpCapture: { type: Function },
    onPointerCancel: { type: Function },
    onPointerCancelCapture: { type: Function },
    onPointerEnter: { type: Function },
    onPointerLeave: { type: Function },
    onPointerOver: { type: Function },
    onPointerOverCapture: { type: Function },
    onPointerOut: { type: Function },
    onPointerOutCapture: { type: Function },
    onGotPointerCapture: { type: Function },
    onGotPointerCaptureCapture: { type: Function },
    onLostPointerCapture: { type: Function },
    onLostPointerCaptureCapture: { type: Function },
    onScroll: { type: Function },
    onScrollCapture: { type: Function },
    onWheel: { type: Function },
    onWheelCapture: { type: Function },
    onAnimationStart: { type: Function },
    onAnimationStartCapture: { type: Function },
    onAnimationEnd: { type: Function },
    onAnimationEndCapture: { type: Function },
    onAnimationIteration: { type: Function },
    onAnimationIterationCapture: { type: Function },
    onTransitionEnd: { type: Function },
    onTransitionEndCapture: { type: Function },
  },
});

export type TwentyUiSidePanelInformationBannerProperties = {
  message: string;
  className?: string;
  variant?: string;
  tooltipMessage?: string;
};

export const TwentyUiSidePanelInformationBannerElement = createRemoteElement<
  TwentyUiSidePanelInformationBannerProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    message: { type: String },
    className: { type: String },
    variant: { type: String },
    tooltipMessage: { type: String },
  },
});

export type TwentyUiCalloutProperties = {
  variant: string;
  title: string;
  description: string;
  learnMoreText: string;
  learnMoreUrl: string;
  onClose: (...args: unknown[]) => unknown;
};

export const TwentyUiCalloutElement = createRemoteElement<
  TwentyUiCalloutProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    variant: { type: String },
    title: { type: String },
    description: { type: String },
    learnMoreText: { type: String },
    learnMoreUrl: { type: String },
    onClose: { type: Function },
  },
});

export type TwentyUiAnimatedCheckmarkProperties = {
  string?: string;
  clipPath?: string;
  filter?: string;
  mask?: string;
  path?: string;
  type?: string;
  className?: string;
  onClick?: (...args: unknown[]) => unknown;
  to?: string;
  target?: string;
  rotate?: string;
  scale?: string;
  color?: string;
  cursor?: string;
  direction?: string;
  display?: string;
  fontFamily?: string;
  fontSize?: string;
  fontSizeAdjust?: string;
  fontStretch?: string;
  fontStyle?: string;
  fontVariant?: string;
  fontWeight?: string;
  height?: string;
  imageRendering?: string;
  letterSpacing?: string;
  opacity?: string;
  order?: string;
  paintOrder?: string;
  pointerEvents?: string;
  textRendering?: string;
  transform?: string;
  unicodeBidi?: string;
  visibility?: string;
  width?: string;
  wordSpacing?: string;
  writingMode?: string;
  offset?: string;
  overflow?: string;
  textDecoration?: string;
  azimuth?: string;
  clip?: string;
  alignmentBaseline?: string;
  baselineShift?: string;
  clipRule?: string;
  colorInterpolation?: string;
  colorRendering?: string;
  dominantBaseline?: string;
  fill?: string;
  fillOpacity?: string;
  fillRule?: string;
  floodColor?: string;
  floodOpacity?: string;
  glyphOrientationVertical?: string;
  lightingColor?: string;
  markerEnd?: string;
  markerMid?: string;
  markerStart?: string;
  shapeRendering?: string;
  stopColor?: string;
  stopOpacity?: string;
  stroke?: string;
  strokeDasharray?: string;
  strokeDashoffset?: string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeMiterlimit?: string;
  strokeOpacity?: string;
  strokeWidth?: string;
  textAnchor?: string;
  vectorEffect?: string;
  alphabetic?: string;
  hanging?: string;
  ideographic?: string;
  mathematical?: string;
  end?: string;
  'aria-label'?: string;
  name?: string;
  suppressHydrationWarning?: boolean;
  id?: string;
  lang?: string;
  tabIndex?: number;
  'aria-activedescendant'?: string;
  'aria-atomic'?: string;
  'aria-autocomplete'?: string;
  'aria-braillelabel'?: string;
  'aria-brailleroledescription'?: string;
  'aria-busy'?: string;
  'aria-checked'?: string;
  'aria-colcount'?: number;
  'aria-colindex'?: number;
  'aria-colindextext'?: string;
  'aria-colspan'?: number;
  'aria-controls'?: string;
  'aria-current'?: string;
  'aria-describedby'?: string;
  'aria-description'?: string;
  'aria-details'?: string;
  'aria-disabled'?: string;
  'aria-dropeffect'?: string;
  'aria-errormessage'?: string;
  'aria-expanded'?: string;
  'aria-flowto'?: string;
  'aria-grabbed'?: string;
  'aria-haspopup'?: string;
  'aria-hidden'?: string;
  'aria-invalid'?: string;
  'aria-keyshortcuts'?: string;
  'aria-labelledby'?: string;
  'aria-level'?: number;
  'aria-live'?: string;
  'aria-modal'?: string;
  'aria-multiline'?: string;
  'aria-multiselectable'?: string;
  'aria-orientation'?: string;
  'aria-owns'?: string;
  'aria-placeholder'?: string;
  'aria-posinset'?: number;
  'aria-pressed'?: string;
  'aria-readonly'?: string;
  'aria-relevant'?: string;
  'aria-required'?: string;
  'aria-roledescription'?: string;
  'aria-rowcount'?: number;
  'aria-rowindex'?: number;
  'aria-rowindextext'?: string;
  'aria-rowspan'?: number;
  'aria-selected'?: string;
  'aria-setsize'?: number;
  'aria-sort'?: string;
  'aria-valuemax'?: number;
  'aria-valuemin'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  dangerouslySetInnerHTML?: Record<string, unknown>;
  onCopy?: (...args: unknown[]) => unknown;
  onCopyCapture?: (...args: unknown[]) => unknown;
  onCut?: (...args: unknown[]) => unknown;
  onCutCapture?: (...args: unknown[]) => unknown;
  onPaste?: (...args: unknown[]) => unknown;
  onPasteCapture?: (...args: unknown[]) => unknown;
  onCompositionEnd?: (...args: unknown[]) => unknown;
  onCompositionEndCapture?: (...args: unknown[]) => unknown;
  onCompositionStart?: (...args: unknown[]) => unknown;
  onCompositionStartCapture?: (...args: unknown[]) => unknown;
  onCompositionUpdate?: (...args: unknown[]) => unknown;
  onCompositionUpdateCapture?: (...args: unknown[]) => unknown;
  onFocus?: (...args: unknown[]) => unknown;
  onFocusCapture?: (...args: unknown[]) => unknown;
  onBlur?: (...args: unknown[]) => unknown;
  onBlurCapture?: (...args: unknown[]) => unknown;
  onChange?: (...args: unknown[]) => unknown;
  onChangeCapture?: (...args: unknown[]) => unknown;
  onBeforeInput?: (...args: unknown[]) => unknown;
  onBeforeInputCapture?: (...args: unknown[]) => unknown;
  onInput?: (...args: unknown[]) => unknown;
  onInputCapture?: (...args: unknown[]) => unknown;
  onReset?: (...args: unknown[]) => unknown;
  onResetCapture?: (...args: unknown[]) => unknown;
  onSubmit?: (...args: unknown[]) => unknown;
  onSubmitCapture?: (...args: unknown[]) => unknown;
  onInvalid?: (...args: unknown[]) => unknown;
  onInvalidCapture?: (...args: unknown[]) => unknown;
  onLoad?: (...args: unknown[]) => unknown;
  onLoadCapture?: (...args: unknown[]) => unknown;
  onError?: (...args: unknown[]) => unknown;
  onErrorCapture?: (...args: unknown[]) => unknown;
  onKeyDown?: (...args: unknown[]) => unknown;
  onKeyDownCapture?: (...args: unknown[]) => unknown;
  onKeyPress?: (...args: unknown[]) => unknown;
  onKeyPressCapture?: (...args: unknown[]) => unknown;
  onKeyUp?: (...args: unknown[]) => unknown;
  onKeyUpCapture?: (...args: unknown[]) => unknown;
  onAbort?: (...args: unknown[]) => unknown;
  onAbortCapture?: (...args: unknown[]) => unknown;
  onCanPlay?: (...args: unknown[]) => unknown;
  onCanPlayCapture?: (...args: unknown[]) => unknown;
  onCanPlayThrough?: (...args: unknown[]) => unknown;
  onCanPlayThroughCapture?: (...args: unknown[]) => unknown;
  onDurationChange?: (...args: unknown[]) => unknown;
  onDurationChangeCapture?: (...args: unknown[]) => unknown;
  onEmptied?: (...args: unknown[]) => unknown;
  onEmptiedCapture?: (...args: unknown[]) => unknown;
  onEncrypted?: (...args: unknown[]) => unknown;
  onEncryptedCapture?: (...args: unknown[]) => unknown;
  onEnded?: (...args: unknown[]) => unknown;
  onEndedCapture?: (...args: unknown[]) => unknown;
  onLoadedData?: (...args: unknown[]) => unknown;
  onLoadedDataCapture?: (...args: unknown[]) => unknown;
  onLoadedMetadata?: (...args: unknown[]) => unknown;
  onLoadedMetadataCapture?: (...args: unknown[]) => unknown;
  onLoadStart?: (...args: unknown[]) => unknown;
  onLoadStartCapture?: (...args: unknown[]) => unknown;
  onPause?: (...args: unknown[]) => unknown;
  onPauseCapture?: (...args: unknown[]) => unknown;
  onPlay?: (...args: unknown[]) => unknown;
  onPlayCapture?: (...args: unknown[]) => unknown;
  onPlaying?: (...args: unknown[]) => unknown;
  onPlayingCapture?: (...args: unknown[]) => unknown;
  onProgress?: (...args: unknown[]) => unknown;
  onProgressCapture?: (...args: unknown[]) => unknown;
  onRateChange?: (...args: unknown[]) => unknown;
  onRateChangeCapture?: (...args: unknown[]) => unknown;
  onResize?: (...args: unknown[]) => unknown;
  onResizeCapture?: (...args: unknown[]) => unknown;
  onSeeked?: (...args: unknown[]) => unknown;
  onSeekedCapture?: (...args: unknown[]) => unknown;
  onSeeking?: (...args: unknown[]) => unknown;
  onSeekingCapture?: (...args: unknown[]) => unknown;
  onStalled?: (...args: unknown[]) => unknown;
  onStalledCapture?: (...args: unknown[]) => unknown;
  onSuspend?: (...args: unknown[]) => unknown;
  onSuspendCapture?: (...args: unknown[]) => unknown;
  onTimeUpdate?: (...args: unknown[]) => unknown;
  onTimeUpdateCapture?: (...args: unknown[]) => unknown;
  onVolumeChange?: (...args: unknown[]) => unknown;
  onVolumeChangeCapture?: (...args: unknown[]) => unknown;
  onWaiting?: (...args: unknown[]) => unknown;
  onWaitingCapture?: (...args: unknown[]) => unknown;
  onAuxClick?: (...args: unknown[]) => unknown;
  onAuxClickCapture?: (...args: unknown[]) => unknown;
  onClickCapture?: (...args: unknown[]) => unknown;
  onContextMenu?: (...args: unknown[]) => unknown;
  onContextMenuCapture?: (...args: unknown[]) => unknown;
  onDoubleClick?: (...args: unknown[]) => unknown;
  onDoubleClickCapture?: (...args: unknown[]) => unknown;
  onDragCapture?: (...args: unknown[]) => unknown;
  onDragEndCapture?: (...args: unknown[]) => unknown;
  onDragEnter?: (...args: unknown[]) => unknown;
  onDragEnterCapture?: (...args: unknown[]) => unknown;
  onDragExit?: (...args: unknown[]) => unknown;
  onDragExitCapture?: (...args: unknown[]) => unknown;
  onDragLeave?: (...args: unknown[]) => unknown;
  onDragLeaveCapture?: (...args: unknown[]) => unknown;
  onDragOver?: (...args: unknown[]) => unknown;
  onDragOverCapture?: (...args: unknown[]) => unknown;
  onDragStartCapture?: (...args: unknown[]) => unknown;
  onDrop?: (...args: unknown[]) => unknown;
  onDropCapture?: (...args: unknown[]) => unknown;
  onMouseDown?: (...args: unknown[]) => unknown;
  onMouseDownCapture?: (...args: unknown[]) => unknown;
  onMouseEnter?: (...args: unknown[]) => unknown;
  onMouseLeave?: (...args: unknown[]) => unknown;
  onMouseMove?: (...args: unknown[]) => unknown;
  onMouseMoveCapture?: (...args: unknown[]) => unknown;
  onMouseOut?: (...args: unknown[]) => unknown;
  onMouseOutCapture?: (...args: unknown[]) => unknown;
  onMouseOver?: (...args: unknown[]) => unknown;
  onMouseOverCapture?: (...args: unknown[]) => unknown;
  onMouseUp?: (...args: unknown[]) => unknown;
  onMouseUpCapture?: (...args: unknown[]) => unknown;
  onSelect?: (...args: unknown[]) => unknown;
  onSelectCapture?: (...args: unknown[]) => unknown;
  onTouchCancel?: (...args: unknown[]) => unknown;
  onTouchCancelCapture?: (...args: unknown[]) => unknown;
  onTouchEnd?: (...args: unknown[]) => unknown;
  onTouchEndCapture?: (...args: unknown[]) => unknown;
  onTouchMove?: (...args: unknown[]) => unknown;
  onTouchMoveCapture?: (...args: unknown[]) => unknown;
  onTouchStart?: (...args: unknown[]) => unknown;
  onTouchStartCapture?: (...args: unknown[]) => unknown;
  onPointerDown?: (...args: unknown[]) => unknown;
  onPointerDownCapture?: (...args: unknown[]) => unknown;
  onPointerMove?: (...args: unknown[]) => unknown;
  onPointerMoveCapture?: (...args: unknown[]) => unknown;
  onPointerUp?: (...args: unknown[]) => unknown;
  onPointerUpCapture?: (...args: unknown[]) => unknown;
  onPointerCancel?: (...args: unknown[]) => unknown;
  onPointerCancelCapture?: (...args: unknown[]) => unknown;
  onPointerEnter?: (...args: unknown[]) => unknown;
  onPointerLeave?: (...args: unknown[]) => unknown;
  onPointerOver?: (...args: unknown[]) => unknown;
  onPointerOverCapture?: (...args: unknown[]) => unknown;
  onPointerOut?: (...args: unknown[]) => unknown;
  onPointerOutCapture?: (...args: unknown[]) => unknown;
  onGotPointerCapture?: (...args: unknown[]) => unknown;
  onGotPointerCaptureCapture?: (...args: unknown[]) => unknown;
  onLostPointerCapture?: (...args: unknown[]) => unknown;
  onLostPointerCaptureCapture?: (...args: unknown[]) => unknown;
  onScroll?: (...args: unknown[]) => unknown;
  onScrollCapture?: (...args: unknown[]) => unknown;
  onWheel?: (...args: unknown[]) => unknown;
  onWheelCapture?: (...args: unknown[]) => unknown;
  onAnimationStartCapture?: (...args: unknown[]) => unknown;
  onAnimationEnd?: (...args: unknown[]) => unknown;
  onAnimationEndCapture?: (...args: unknown[]) => unknown;
  onAnimationIteration?: (...args: unknown[]) => unknown;
  onAnimationIterationCapture?: (...args: unknown[]) => unknown;
  onTransitionEnd?: (...args: unknown[]) => unknown;
  onTransitionEndCapture?: (...args: unknown[]) => unknown;
  max?: string;
  media?: string;
  method?: string;
  min?: string;
  crossOrigin?: string;
  accentHeight?: string;
  accumulate?: string;
  additive?: string;
  allowReorder?: string;
  amplitude?: string;
  arabicForm?: string;
  ascent?: string;
  attributeName?: string;
  attributeType?: string;
  autoReverse?: string;
  baseFrequency?: string;
  baseProfile?: string;
  bbox?: string;
  begin?: string;
  bias?: string;
  by?: string;
  calcMode?: string;
  capHeight?: string;
  clipPathUnits?: string;
  colorInterpolationFilters?: string;
  colorProfile?: string;
  contentScriptType?: string;
  contentStyleType?: string;
  cx?: string;
  cy?: string;
  d?: string;
  decelerate?: string;
  descent?: string;
  diffuseConstant?: string;
  divisor?: string;
  dur?: string;
  dx?: string;
  dy?: string;
  edgeMode?: string;
  elevation?: string;
  enableBackground?: string;
  exponent?: string;
  externalResourcesRequired?: string;
  filterRes?: string;
  filterUnits?: string;
  focusable?: string;
  format?: string;
  fr?: string;
  from?: string;
  fx?: string;
  fy?: string;
  g1?: string;
  g2?: string;
  glyphName?: string;
  glyphOrientationHorizontal?: string;
  glyphRef?: string;
  gradientTransform?: string;
  gradientUnits?: string;
  horizAdvX?: string;
  horizOriginX?: string;
  href?: string;
  in2?: string;
  in?: string;
  intercept?: string;
  k1?: string;
  k2?: string;
  k3?: string;
  k4?: string;
  k?: string;
  kernelMatrix?: string;
  kernelUnitLength?: string;
  kerning?: string;
  keyPoints?: string;
  keySplines?: string;
  keyTimes?: string;
  lengthAdjust?: string;
  limitingConeAngle?: string;
  local?: string;
  markerHeight?: string;
  markerUnits?: string;
  markerWidth?: string;
  maskContentUnits?: string;
  maskUnits?: string;
  mode?: string;
  numOctaves?: string;
  operator?: string;
  orient?: string;
  orientation?: string;
  origin?: string;
  overlinePosition?: string;
  overlineThickness?: string;
  panose1?: string;
  pathLength?: string;
  patternContentUnits?: string;
  patternTransform?: string;
  patternUnits?: string;
  points?: string;
  pointsAtX?: string;
  pointsAtY?: string;
  pointsAtZ?: string;
  preserveAlpha?: string;
  preserveAspectRatio?: string;
  primitiveUnits?: string;
  r?: string;
  radius?: string;
  refX?: string;
  refY?: string;
  renderingIntent?: string;
  repeatCount?: string;
  repeatDur?: string;
  requiredExtensions?: string;
  requiredFeatures?: string;
  restart?: string;
  result?: string;
  rx?: string;
  ry?: string;
  seed?: string;
  slope?: string;
  spacing?: string;
  specularConstant?: string;
  specularExponent?: string;
  speed?: string;
  spreadMethod?: string;
  startOffset?: string;
  stdDeviation?: string;
  stemh?: string;
  stemv?: string;
  stitchTiles?: string;
  strikethroughPosition?: string;
  strikethroughThickness?: string;
  surfaceScale?: string;
  systemLanguage?: string;
  tableValues?: string;
  targetX?: string;
  targetY?: string;
  textLength?: string;
  u1?: string;
  u2?: string;
  underlinePosition?: string;
  underlineThickness?: string;
  unicode?: string;
  unicodeRange?: string;
  unitsPerEm?: string;
  vAlphabetic?: string;
  values?: string;
  version?: string;
  vertAdvY?: string;
  vertOriginX?: string;
  vertOriginY?: string;
  vHanging?: string;
  vIdeographic?: string;
  viewBox?: string;
  viewTarget?: string;
  vMathematical?: string;
  widths?: string;
  x1?: string;
  x2?: string;
  x?: string;
  xChannelSelector?: string;
  xHeight?: string;
  xlinkActuate?: string;
  xlinkArcrole?: string;
  xlinkHref?: string;
  xlinkRole?: string;
  xlinkShow?: string;
  xlinkTitle?: string;
  xlinkType?: string;
  xmlBase?: string;
  xmlLang?: string;
  xmlns?: string;
  xmlnsXlink?: string;
  xmlSpace?: string;
  y1?: string;
  y2?: string;
  y?: string;
  yChannelSelector?: string;
  z?: string;
  zoomAndPan?: string;
  transformTemplate?: (...args: unknown[]) => unknown;
  'data-framer-appear-id'?: string;
  variants?: Record<string, unknown>;
  onBeforeLayoutMeasure?: (...args: unknown[]) => unknown;
  onLayoutMeasure?: (...args: unknown[]) => unknown;
  onUpdate?: (...args: unknown[]) => unknown;
  onAnimationStart?: (...args: unknown[]) => unknown;
  onAnimationComplete?: (...args: unknown[]) => unknown;
  onPan?: (...args: unknown[]) => unknown;
  onPanStart?: (...args: unknown[]) => unknown;
  onPanSessionStart?: (...args: unknown[]) => unknown;
  onPanEnd?: (...args: unknown[]) => unknown;
  onTap?: (...args: unknown[]) => unknown;
  onTapStart?: (...args: unknown[]) => unknown;
  onTapCancel?: (...args: unknown[]) => unknown;
  globalTapTarget?: boolean;
  onHoverStart?: (...args: unknown[]) => unknown;
  onHoverEnd?: (...args: unknown[]) => unknown;
  onViewportEnter?: (...args: unknown[]) => unknown;
  onViewportLeave?: (...args: unknown[]) => unknown;
  viewport?: Record<string, unknown>;
  drag?: string;
  dragDirectionLock?: boolean;
  dragPropagation?: boolean;
  dragMomentum?: boolean;
  dragTransition?: Record<string, unknown>;
  dragControls?: Record<string, unknown>;
  dragSnapToOrigin?: boolean;
  dragListener?: boolean;
  onMeasureDragConstraints?: (...args: unknown[]) => unknown;
  _dragX?: Record<string, unknown>;
  _dragY?: Record<string, unknown>;
  onDragStart?: (...args: unknown[]) => unknown;
  onDragEnd?: (...args: unknown[]) => unknown;
  onDrag?: (...args: unknown[]) => unknown;
  onDirectionLock?: (...args: unknown[]) => unknown;
  onDragTransitionEnd?: (...args: unknown[]) => unknown;
  layout?: string;
  layoutId?: string;
  onLayoutAnimationStart?: (...args: unknown[]) => unknown;
  onLayoutAnimationComplete?: (...args: unknown[]) => unknown;
  layoutScroll?: boolean;
  layoutRoot?: boolean;
  'data-framer-portal-id'?: string;
  inherit?: boolean;
  ignoreStrict?: boolean;
  isAnimating?: boolean;
  duration?: number;
  size?: number;
};

export const TwentyUiAnimatedCheckmarkElement = createRemoteElement<
  TwentyUiAnimatedCheckmarkProperties,
  Record<string, never>,
  { children: true },
  Record<string, never>
>({
  slots: ['children'],
  properties: {
    string: { type: String },
    clipPath: { type: String },
    filter: { type: String },
    mask: { type: String },
    path: { type: String },
    type: { type: String },
    className: { type: String },
    onClick: { type: Function },
    to: { type: String },
    target: { type: String },
    rotate: { type: String },
    scale: { type: String },
    color: { type: String },
    cursor: { type: String },
    direction: { type: String },
    display: { type: String },
    fontFamily: { type: String },
    fontSize: { type: String },
    fontSizeAdjust: { type: String },
    fontStretch: { type: String },
    fontStyle: { type: String },
    fontVariant: { type: String },
    fontWeight: { type: String },
    height: { type: String },
    imageRendering: { type: String },
    letterSpacing: { type: String },
    opacity: { type: String },
    order: { type: String },
    paintOrder: { type: String },
    pointerEvents: { type: String },
    textRendering: { type: String },
    transform: { type: String },
    unicodeBidi: { type: String },
    visibility: { type: String },
    width: { type: String },
    wordSpacing: { type: String },
    writingMode: { type: String },
    offset: { type: String },
    overflow: { type: String },
    textDecoration: { type: String },
    azimuth: { type: String },
    clip: { type: String },
    alignmentBaseline: { type: String },
    baselineShift: { type: String },
    clipRule: { type: String },
    colorInterpolation: { type: String },
    colorRendering: { type: String },
    dominantBaseline: { type: String },
    fill: { type: String },
    fillOpacity: { type: String },
    fillRule: { type: String },
    floodColor: { type: String },
    floodOpacity: { type: String },
    glyphOrientationVertical: { type: String },
    lightingColor: { type: String },
    markerEnd: { type: String },
    markerMid: { type: String },
    markerStart: { type: String },
    shapeRendering: { type: String },
    stopColor: { type: String },
    stopOpacity: { type: String },
    stroke: { type: String },
    strokeDasharray: { type: String },
    strokeDashoffset: { type: String },
    strokeLinecap: { type: String },
    strokeLinejoin: { type: String },
    strokeMiterlimit: { type: String },
    strokeOpacity: { type: String },
    strokeWidth: { type: String },
    textAnchor: { type: String },
    vectorEffect: { type: String },
    alphabetic: { type: String },
    hanging: { type: String },
    ideographic: { type: String },
    mathematical: { type: String },
    end: { type: String },
    'aria-label': { type: String },
    name: { type: String },
    suppressHydrationWarning: { type: Boolean },
    id: { type: String },
    lang: { type: String },
    tabIndex: { type: Number },
    'aria-activedescendant': { type: String },
    'aria-atomic': { type: String },
    'aria-autocomplete': { type: String },
    'aria-braillelabel': { type: String },
    'aria-brailleroledescription': { type: String },
    'aria-busy': { type: String },
    'aria-checked': { type: String },
    'aria-colcount': { type: Number },
    'aria-colindex': { type: Number },
    'aria-colindextext': { type: String },
    'aria-colspan': { type: Number },
    'aria-controls': { type: String },
    'aria-current': { type: String },
    'aria-describedby': { type: String },
    'aria-description': { type: String },
    'aria-details': { type: String },
    'aria-disabled': { type: String },
    'aria-dropeffect': { type: String },
    'aria-errormessage': { type: String },
    'aria-expanded': { type: String },
    'aria-flowto': { type: String },
    'aria-grabbed': { type: String },
    'aria-haspopup': { type: String },
    'aria-hidden': { type: String },
    'aria-invalid': { type: String },
    'aria-keyshortcuts': { type: String },
    'aria-labelledby': { type: String },
    'aria-level': { type: Number },
    'aria-live': { type: String },
    'aria-modal': { type: String },
    'aria-multiline': { type: String },
    'aria-multiselectable': { type: String },
    'aria-orientation': { type: String },
    'aria-owns': { type: String },
    'aria-placeholder': { type: String },
    'aria-posinset': { type: Number },
    'aria-pressed': { type: String },
    'aria-readonly': { type: String },
    'aria-relevant': { type: String },
    'aria-required': { type: String },
    'aria-roledescription': { type: String },
    'aria-rowcount': { type: Number },
    'aria-rowindex': { type: Number },
    'aria-rowindextext': { type: String },
    'aria-rowspan': { type: Number },
    'aria-selected': { type: String },
    'aria-setsize': { type: Number },
    'aria-sort': { type: String },
    'aria-valuemax': { type: Number },
    'aria-valuemin': { type: Number },
    'aria-valuenow': { type: Number },
    'aria-valuetext': { type: String },
    dangerouslySetInnerHTML: { type: Object },
    onCopy: { type: Function },
    onCopyCapture: { type: Function },
    onCut: { type: Function },
    onCutCapture: { type: Function },
    onPaste: { type: Function },
    onPasteCapture: { type: Function },
    onCompositionEnd: { type: Function },
    onCompositionEndCapture: { type: Function },
    onCompositionStart: { type: Function },
    onCompositionStartCapture: { type: Function },
    onCompositionUpdate: { type: Function },
    onCompositionUpdateCapture: { type: Function },
    onFocus: { type: Function },
    onFocusCapture: { type: Function },
    onBlur: { type: Function },
    onBlurCapture: { type: Function },
    onChange: { type: Function },
    onChangeCapture: { type: Function },
    onBeforeInput: { type: Function },
    onBeforeInputCapture: { type: Function },
    onInput: { type: Function },
    onInputCapture: { type: Function },
    onReset: { type: Function },
    onResetCapture: { type: Function },
    onSubmit: { type: Function },
    onSubmitCapture: { type: Function },
    onInvalid: { type: Function },
    onInvalidCapture: { type: Function },
    onLoad: { type: Function },
    onLoadCapture: { type: Function },
    onError: { type: Function },
    onErrorCapture: { type: Function },
    onKeyDown: { type: Function },
    onKeyDownCapture: { type: Function },
    onKeyPress: { type: Function },
    onKeyPressCapture: { type: Function },
    onKeyUp: { type: Function },
    onKeyUpCapture: { type: Function },
    onAbort: { type: Function },
    onAbortCapture: { type: Function },
    onCanPlay: { type: Function },
    onCanPlayCapture: { type: Function },
    onCanPlayThrough: { type: Function },
    onCanPlayThroughCapture: { type: Function },
    onDurationChange: { type: Function },
    onDurationChangeCapture: { type: Function },
    onEmptied: { type: Function },
    onEmptiedCapture: { type: Function },
    onEncrypted: { type: Function },
    onEncryptedCapture: { type: Function },
    onEnded: { type: Function },
    onEndedCapture: { type: Function },
    onLoadedData: { type: Function },
    onLoadedDataCapture: { type: Function },
    onLoadedMetadata: { type: Function },
    onLoadedMetadataCapture: { type: Function },
    onLoadStart: { type: Function },
    onLoadStartCapture: { type: Function },
    onPause: { type: Function },
    onPauseCapture: { type: Function },
    onPlay: { type: Function },
    onPlayCapture: { type: Function },
    onPlaying: { type: Function },
    onPlayingCapture: { type: Function },
    onProgress: { type: Function },
    onProgressCapture: { type: Function },
    onRateChange: { type: Function },
    onRateChangeCapture: { type: Function },
    onResize: { type: Function },
    onResizeCapture: { type: Function },
    onSeeked: { type: Function },
    onSeekedCapture: { type: Function },
    onSeeking: { type: Function },
    onSeekingCapture: { type: Function },
    onStalled: { type: Function },
    onStalledCapture: { type: Function },
    onSuspend: { type: Function },
    onSuspendCapture: { type: Function },
    onTimeUpdate: { type: Function },
    onTimeUpdateCapture: { type: Function },
    onVolumeChange: { type: Function },
    onVolumeChangeCapture: { type: Function },
    onWaiting: { type: Function },
    onWaitingCapture: { type: Function },
    onAuxClick: { type: Function },
    onAuxClickCapture: { type: Function },
    onClickCapture: { type: Function },
    onContextMenu: { type: Function },
    onContextMenuCapture: { type: Function },
    onDoubleClick: { type: Function },
    onDoubleClickCapture: { type: Function },
    onDragCapture: { type: Function },
    onDragEndCapture: { type: Function },
    onDragEnter: { type: Function },
    onDragEnterCapture: { type: Function },
    onDragExit: { type: Function },
    onDragExitCapture: { type: Function },
    onDragLeave: { type: Function },
    onDragLeaveCapture: { type: Function },
    onDragOver: { type: Function },
    onDragOverCapture: { type: Function },
    onDragStartCapture: { type: Function },
    onDrop: { type: Function },
    onDropCapture: { type: Function },
    onMouseDown: { type: Function },
    onMouseDownCapture: { type: Function },
    onMouseEnter: { type: Function },
    onMouseLeave: { type: Function },
    onMouseMove: { type: Function },
    onMouseMoveCapture: { type: Function },
    onMouseOut: { type: Function },
    onMouseOutCapture: { type: Function },
    onMouseOver: { type: Function },
    onMouseOverCapture: { type: Function },
    onMouseUp: { type: Function },
    onMouseUpCapture: { type: Function },
    onSelect: { type: Function },
    onSelectCapture: { type: Function },
    onTouchCancel: { type: Function },
    onTouchCancelCapture: { type: Function },
    onTouchEnd: { type: Function },
    onTouchEndCapture: { type: Function },
    onTouchMove: { type: Function },
    onTouchMoveCapture: { type: Function },
    onTouchStart: { type: Function },
    onTouchStartCapture: { type: Function },
    onPointerDown: { type: Function },
    onPointerDownCapture: { type: Function },
    onPointerMove: { type: Function },
    onPointerMoveCapture: { type: Function },
    onPointerUp: { type: Function },
    onPointerUpCapture: { type: Function },
    onPointerCancel: { type: Function },
    onPointerCancelCapture: { type: Function },
    onPointerEnter: { type: Function },
    onPointerLeave: { type: Function },
    onPointerOver: { type: Function },
    onPointerOverCapture: { type: Function },
    onPointerOut: { type: Function },
    onPointerOutCapture: { type: Function },
    onGotPointerCapture: { type: Function },
    onGotPointerCaptureCapture: { type: Function },
    onLostPointerCapture: { type: Function },
    onLostPointerCaptureCapture: { type: Function },
    onScroll: { type: Function },
    onScrollCapture: { type: Function },
    onWheel: { type: Function },
    onWheelCapture: { type: Function },
    onAnimationStartCapture: { type: Function },
    onAnimationEnd: { type: Function },
    onAnimationEndCapture: { type: Function },
    onAnimationIteration: { type: Function },
    onAnimationIterationCapture: { type: Function },
    onTransitionEnd: { type: Function },
    onTransitionEndCapture: { type: Function },
    max: { type: String },
    media: { type: String },
    method: { type: String },
    min: { type: String },
    crossOrigin: { type: String },
    accentHeight: { type: String },
    accumulate: { type: String },
    additive: { type: String },
    allowReorder: { type: String },
    amplitude: { type: String },
    arabicForm: { type: String },
    ascent: { type: String },
    attributeName: { type: String },
    attributeType: { type: String },
    autoReverse: { type: String },
    baseFrequency: { type: String },
    baseProfile: { type: String },
    bbox: { type: String },
    begin: { type: String },
    bias: { type: String },
    by: { type: String },
    calcMode: { type: String },
    capHeight: { type: String },
    clipPathUnits: { type: String },
    colorInterpolationFilters: { type: String },
    colorProfile: { type: String },
    contentScriptType: { type: String },
    contentStyleType: { type: String },
    cx: { type: String },
    cy: { type: String },
    d: { type: String },
    decelerate: { type: String },
    descent: { type: String },
    diffuseConstant: { type: String },
    divisor: { type: String },
    dur: { type: String },
    dx: { type: String },
    dy: { type: String },
    edgeMode: { type: String },
    elevation: { type: String },
    enableBackground: { type: String },
    exponent: { type: String },
    externalResourcesRequired: { type: String },
    filterRes: { type: String },
    filterUnits: { type: String },
    focusable: { type: String },
    format: { type: String },
    fr: { type: String },
    from: { type: String },
    fx: { type: String },
    fy: { type: String },
    g1: { type: String },
    g2: { type: String },
    glyphName: { type: String },
    glyphOrientationHorizontal: { type: String },
    glyphRef: { type: String },
    gradientTransform: { type: String },
    gradientUnits: { type: String },
    horizAdvX: { type: String },
    horizOriginX: { type: String },
    href: { type: String },
    in2: { type: String },
    in: { type: String },
    intercept: { type: String },
    k1: { type: String },
    k2: { type: String },
    k3: { type: String },
    k4: { type: String },
    k: { type: String },
    kernelMatrix: { type: String },
    kernelUnitLength: { type: String },
    kerning: { type: String },
    keyPoints: { type: String },
    keySplines: { type: String },
    keyTimes: { type: String },
    lengthAdjust: { type: String },
    limitingConeAngle: { type: String },
    local: { type: String },
    markerHeight: { type: String },
    markerUnits: { type: String },
    markerWidth: { type: String },
    maskContentUnits: { type: String },
    maskUnits: { type: String },
    mode: { type: String },
    numOctaves: { type: String },
    operator: { type: String },
    orient: { type: String },
    orientation: { type: String },
    origin: { type: String },
    overlinePosition: { type: String },
    overlineThickness: { type: String },
    panose1: { type: String },
    pathLength: { type: String },
    patternContentUnits: { type: String },
    patternTransform: { type: String },
    patternUnits: { type: String },
    points: { type: String },
    pointsAtX: { type: String },
    pointsAtY: { type: String },
    pointsAtZ: { type: String },
    preserveAlpha: { type: String },
    preserveAspectRatio: { type: String },
    primitiveUnits: { type: String },
    r: { type: String },
    radius: { type: String },
    refX: { type: String },
    refY: { type: String },
    renderingIntent: { type: String },
    repeatCount: { type: String },
    repeatDur: { type: String },
    requiredExtensions: { type: String },
    requiredFeatures: { type: String },
    restart: { type: String },
    result: { type: String },
    rx: { type: String },
    ry: { type: String },
    seed: { type: String },
    slope: { type: String },
    spacing: { type: String },
    specularConstant: { type: String },
    specularExponent: { type: String },
    speed: { type: String },
    spreadMethod: { type: String },
    startOffset: { type: String },
    stdDeviation: { type: String },
    stemh: { type: String },
    stemv: { type: String },
    stitchTiles: { type: String },
    strikethroughPosition: { type: String },
    strikethroughThickness: { type: String },
    surfaceScale: { type: String },
    systemLanguage: { type: String },
    tableValues: { type: String },
    targetX: { type: String },
    targetY: { type: String },
    textLength: { type: String },
    u1: { type: String },
    u2: { type: String },
    underlinePosition: { type: String },
    underlineThickness: { type: String },
    unicode: { type: String },
    unicodeRange: { type: String },
    unitsPerEm: { type: String },
    vAlphabetic: { type: String },
    values: { type: String },
    version: { type: String },
    vertAdvY: { type: String },
    vertOriginX: { type: String },
    vertOriginY: { type: String },
    vHanging: { type: String },
    vIdeographic: { type: String },
    viewBox: { type: String },
    viewTarget: { type: String },
    vMathematical: { type: String },
    widths: { type: String },
    x1: { type: String },
    x2: { type: String },
    x: { type: String },
    xChannelSelector: { type: String },
    xHeight: { type: String },
    xlinkActuate: { type: String },
    xlinkArcrole: { type: String },
    xlinkHref: { type: String },
    xlinkRole: { type: String },
    xlinkShow: { type: String },
    xlinkTitle: { type: String },
    xlinkType: { type: String },
    xmlBase: { type: String },
    xmlLang: { type: String },
    xmlns: { type: String },
    xmlnsXlink: { type: String },
    xmlSpace: { type: String },
    y1: { type: String },
    y2: { type: String },
    y: { type: String },
    yChannelSelector: { type: String },
    z: { type: String },
    zoomAndPan: { type: String },
    transformTemplate: { type: Function },
    'data-framer-appear-id': { type: String },
    variants: { type: Object },
    onBeforeLayoutMeasure: { type: Function },
    onLayoutMeasure: { type: Function },
    onUpdate: { type: Function },
    onAnimationStart: { type: Function },
    onAnimationComplete: { type: Function },
    onPan: { type: Function },
    onPanStart: { type: Function },
    onPanSessionStart: { type: Function },
    onPanEnd: { type: Function },
    onTap: { type: Function },
    onTapStart: { type: Function },
    onTapCancel: { type: Function },
    globalTapTarget: { type: Boolean },
    onHoverStart: { type: Function },
    onHoverEnd: { type: Function },
    onViewportEnter: { type: Function },
    onViewportLeave: { type: Function },
    viewport: { type: Object },
    drag: { type: String },
    dragDirectionLock: { type: Boolean },
    dragPropagation: { type: Boolean },
    dragMomentum: { type: Boolean },
    dragTransition: { type: Object },
    dragControls: { type: Object },
    dragSnapToOrigin: { type: Boolean },
    dragListener: { type: Boolean },
    onMeasureDragConstraints: { type: Function },
    _dragX: { type: Object },
    _dragY: { type: Object },
    onDragStart: { type: Function },
    onDragEnd: { type: Function },
    onDrag: { type: Function },
    onDirectionLock: { type: Function },
    onDragTransitionEnd: { type: Function },
    layout: { type: String },
    layoutId: { type: String },
    onLayoutAnimationStart: { type: Function },
    onLayoutAnimationComplete: { type: Function },
    layoutScroll: { type: Boolean },
    layoutRoot: { type: Boolean },
    'data-framer-portal-id': { type: String },
    inherit: { type: Boolean },
    ignoreStrict: { type: Boolean },
    isAnimating: { type: Boolean },
    duration: { type: Number },
    size: { type: Number },
  },
});

export type TwentyUiCheckmarkProperties = {
  slot?: string;
  style?: Record<string, unknown>;
  title?: string;
  className?: string;
  onClick?: (...args: unknown[]) => unknown;
  color?: string;
  content?: string;
  translate?: string;
  hidden?: boolean;
  'aria-label'?: string;
  defaultChecked?: boolean;
  suppressContentEditableWarning?: boolean;
  suppressHydrationWarning?: boolean;
  accessKey?: string;
  autoFocus?: boolean;
  contentEditable?: string;
  contextMenu?: string;
  dir?: string;
  draggable?: string;
  id?: string;
  lang?: string;
  nonce?: string;
  spellCheck?: string;
  tabIndex?: number;
  radioGroup?: string;
  about?: string;
  datatype?: string;
  prefix?: string;
  property?: string;
  rel?: string;
  resource?: string;
  rev?: string;
  typeof?: string;
  vocab?: string;
  autoCapitalize?: string;
  autoCorrect?: string;
  autoSave?: string;
  itemProp?: string;
  itemScope?: boolean;
  itemType?: string;
  itemID?: string;
  itemRef?: string;
  results?: number;
  security?: string;
  unselectable?: string;
  inputMode?: string;
  is?: string;
  'data-tooltip-id'?: string;
  'data-tooltip-place'?: string;
  'data-tooltip-content'?: string;
  'data-tooltip-html'?: string;
  'data-tooltip-variant'?: string;
  'data-tooltip-offset'?: number;
  'data-tooltip-events'?: unknown[];
  'data-tooltip-position-strategy'?: string;
  'data-tooltip-delay-show'?: number;
  'data-tooltip-delay-hide'?: number;
  'data-tooltip-float'?: boolean;
  'data-tooltip-hidden'?: boolean;
  'data-tooltip-class-name'?: string;
  'aria-activedescendant'?: string;
  'aria-atomic'?: string;
  'aria-autocomplete'?: string;
  'aria-braillelabel'?: string;
  'aria-brailleroledescription'?: string;
  'aria-busy'?: string;
  'aria-checked'?: string;
  'aria-colcount'?: number;
  'aria-colindex'?: number;
  'aria-colindextext'?: string;
  'aria-colspan'?: number;
  'aria-controls'?: string;
  'aria-current'?: string;
  'aria-describedby'?: string;
  'aria-description'?: string;
  'aria-details'?: string;
  'aria-disabled'?: string;
  'aria-dropeffect'?: string;
  'aria-errormessage'?: string;
  'aria-expanded'?: string;
  'aria-flowto'?: string;
  'aria-grabbed'?: string;
  'aria-haspopup'?: string;
  'aria-hidden'?: string;
  'aria-invalid'?: string;
  'aria-keyshortcuts'?: string;
  'aria-labelledby'?: string;
  'aria-level'?: number;
  'aria-live'?: string;
  'aria-modal'?: string;
  'aria-multiline'?: string;
  'aria-multiselectable'?: string;
  'aria-orientation'?: string;
  'aria-owns'?: string;
  'aria-placeholder'?: string;
  'aria-posinset'?: number;
  'aria-pressed'?: string;
  'aria-readonly'?: string;
  'aria-relevant'?: string;
  'aria-required'?: string;
  'aria-roledescription'?: string;
  'aria-rowcount'?: number;
  'aria-rowindex'?: number;
  'aria-rowindextext'?: string;
  'aria-rowspan'?: number;
  'aria-selected'?: string;
  'aria-setsize'?: number;
  'aria-sort'?: string;
  'aria-valuemax'?: number;
  'aria-valuemin'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  dangerouslySetInnerHTML?: Record<string, unknown>;
  onCopy?: (...args: unknown[]) => unknown;
  onCopyCapture?: (...args: unknown[]) => unknown;
  onCut?: (...args: unknown[]) => unknown;
  onCutCapture?: (...args: unknown[]) => unknown;
  onPaste?: (...args: unknown[]) => unknown;
  onPasteCapture?: (...args: unknown[]) => unknown;
  onCompositionEnd?: (...args: unknown[]) => unknown;
  onCompositionEndCapture?: (...args: unknown[]) => unknown;
  onCompositionStart?: (...args: unknown[]) => unknown;
  onCompositionStartCapture?: (...args: unknown[]) => unknown;
  onCompositionUpdate?: (...args: unknown[]) => unknown;
  onCompositionUpdateCapture?: (...args: unknown[]) => unknown;
  onFocus?: (...args: unknown[]) => unknown;
  onFocusCapture?: (...args: unknown[]) => unknown;
  onBlur?: (...args: unknown[]) => unknown;
  onBlurCapture?: (...args: unknown[]) => unknown;
  onChange?: (...args: unknown[]) => unknown;
  onChangeCapture?: (...args: unknown[]) => unknown;
  onBeforeInput?: (...args: unknown[]) => unknown;
  onBeforeInputCapture?: (...args: unknown[]) => unknown;
  onInput?: (...args: unknown[]) => unknown;
  onInputCapture?: (...args: unknown[]) => unknown;
  onReset?: (...args: unknown[]) => unknown;
  onResetCapture?: (...args: unknown[]) => unknown;
  onSubmit?: (...args: unknown[]) => unknown;
  onSubmitCapture?: (...args: unknown[]) => unknown;
  onInvalid?: (...args: unknown[]) => unknown;
  onInvalidCapture?: (...args: unknown[]) => unknown;
  onLoad?: (...args: unknown[]) => unknown;
  onLoadCapture?: (...args: unknown[]) => unknown;
  onError?: (...args: unknown[]) => unknown;
  onErrorCapture?: (...args: unknown[]) => unknown;
  onKeyDown?: (...args: unknown[]) => unknown;
  onKeyDownCapture?: (...args: unknown[]) => unknown;
  onKeyPress?: (...args: unknown[]) => unknown;
  onKeyPressCapture?: (...args: unknown[]) => unknown;
  onKeyUp?: (...args: unknown[]) => unknown;
  onKeyUpCapture?: (...args: unknown[]) => unknown;
  onAbort?: (...args: unknown[]) => unknown;
  onAbortCapture?: (...args: unknown[]) => unknown;
  onCanPlay?: (...args: unknown[]) => unknown;
  onCanPlayCapture?: (...args: unknown[]) => unknown;
  onCanPlayThrough?: (...args: unknown[]) => unknown;
  onCanPlayThroughCapture?: (...args: unknown[]) => unknown;
  onDurationChange?: (...args: unknown[]) => unknown;
  onDurationChangeCapture?: (...args: unknown[]) => unknown;
  onEmptied?: (...args: unknown[]) => unknown;
  onEmptiedCapture?: (...args: unknown[]) => unknown;
  onEncrypted?: (...args: unknown[]) => unknown;
  onEncryptedCapture?: (...args: unknown[]) => unknown;
  onEnded?: (...args: unknown[]) => unknown;
  onEndedCapture?: (...args: unknown[]) => unknown;
  onLoadedData?: (...args: unknown[]) => unknown;
  onLoadedDataCapture?: (...args: unknown[]) => unknown;
  onLoadedMetadata?: (...args: unknown[]) => unknown;
  onLoadedMetadataCapture?: (...args: unknown[]) => unknown;
  onLoadStart?: (...args: unknown[]) => unknown;
  onLoadStartCapture?: (...args: unknown[]) => unknown;
  onPause?: (...args: unknown[]) => unknown;
  onPauseCapture?: (...args: unknown[]) => unknown;
  onPlay?: (...args: unknown[]) => unknown;
  onPlayCapture?: (...args: unknown[]) => unknown;
  onPlaying?: (...args: unknown[]) => unknown;
  onPlayingCapture?: (...args: unknown[]) => unknown;
  onProgress?: (...args: unknown[]) => unknown;
  onProgressCapture?: (...args: unknown[]) => unknown;
  onRateChange?: (...args: unknown[]) => unknown;
  onRateChangeCapture?: (...args: unknown[]) => unknown;
  onResize?: (...args: unknown[]) => unknown;
  onResizeCapture?: (...args: unknown[]) => unknown;
  onSeeked?: (...args: unknown[]) => unknown;
  onSeekedCapture?: (...args: unknown[]) => unknown;
  onSeeking?: (...args: unknown[]) => unknown;
  onSeekingCapture?: (...args: unknown[]) => unknown;
  onStalled?: (...args: unknown[]) => unknown;
  onStalledCapture?: (...args: unknown[]) => unknown;
  onSuspend?: (...args: unknown[]) => unknown;
  onSuspendCapture?: (...args: unknown[]) => unknown;
  onTimeUpdate?: (...args: unknown[]) => unknown;
  onTimeUpdateCapture?: (...args: unknown[]) => unknown;
  onVolumeChange?: (...args: unknown[]) => unknown;
  onVolumeChangeCapture?: (...args: unknown[]) => unknown;
  onWaiting?: (...args: unknown[]) => unknown;
  onWaitingCapture?: (...args: unknown[]) => unknown;
  onAuxClick?: (...args: unknown[]) => unknown;
  onAuxClickCapture?: (...args: unknown[]) => unknown;
  onClickCapture?: (...args: unknown[]) => unknown;
  onContextMenu?: (...args: unknown[]) => unknown;
  onContextMenuCapture?: (...args: unknown[]) => unknown;
  onDoubleClick?: (...args: unknown[]) => unknown;
  onDoubleClickCapture?: (...args: unknown[]) => unknown;
  onDrag?: (...args: unknown[]) => unknown;
  onDragCapture?: (...args: unknown[]) => unknown;
  onDragEnd?: (...args: unknown[]) => unknown;
  onDragEndCapture?: (...args: unknown[]) => unknown;
  onDragEnter?: (...args: unknown[]) => unknown;
  onDragEnterCapture?: (...args: unknown[]) => unknown;
  onDragExit?: (...args: unknown[]) => unknown;
  onDragExitCapture?: (...args: unknown[]) => unknown;
  onDragLeave?: (...args: unknown[]) => unknown;
  onDragLeaveCapture?: (...args: unknown[]) => unknown;
  onDragOver?: (...args: unknown[]) => unknown;
  onDragOverCapture?: (...args: unknown[]) => unknown;
  onDragStart?: (...args: unknown[]) => unknown;
  onDragStartCapture?: (...args: unknown[]) => unknown;
  onDrop?: (...args: unknown[]) => unknown;
  onDropCapture?: (...args: unknown[]) => unknown;
  onMouseDown?: (...args: unknown[]) => unknown;
  onMouseDownCapture?: (...args: unknown[]) => unknown;
  onMouseEnter?: (...args: unknown[]) => unknown;
  onMouseLeave?: (...args: unknown[]) => unknown;
  onMouseMove?: (...args: unknown[]) => unknown;
  onMouseMoveCapture?: (...args: unknown[]) => unknown;
  onMouseOut?: (...args: unknown[]) => unknown;
  onMouseOutCapture?: (...args: unknown[]) => unknown;
  onMouseOver?: (...args: unknown[]) => unknown;
  onMouseOverCapture?: (...args: unknown[]) => unknown;
  onMouseUp?: (...args: unknown[]) => unknown;
  onMouseUpCapture?: (...args: unknown[]) => unknown;
  onSelect?: (...args: unknown[]) => unknown;
  onSelectCapture?: (...args: unknown[]) => unknown;
  onTouchCancel?: (...args: unknown[]) => unknown;
  onTouchCancelCapture?: (...args: unknown[]) => unknown;
  onTouchEnd?: (...args: unknown[]) => unknown;
  onTouchEndCapture?: (...args: unknown[]) => unknown;
  onTouchMove?: (...args: unknown[]) => unknown;
  onTouchMoveCapture?: (...args: unknown[]) => unknown;
  onTouchStart?: (...args: unknown[]) => unknown;
  onTouchStartCapture?: (...args: unknown[]) => unknown;
  onPointerDown?: (...args: unknown[]) => unknown;
  onPointerDownCapture?: (...args: unknown[]) => unknown;
  onPointerMove?: (...args: unknown[]) => unknown;
  onPointerMoveCapture?: (...args: unknown[]) => unknown;
  onPointerUp?: (...args: unknown[]) => unknown;
  onPointerUpCapture?: (...args: unknown[]) => unknown;
  onPointerCancel?: (...args: unknown[]) => unknown;
  onPointerCancelCapture?: (...args: unknown[]) => unknown;
  onPointerEnter?: (...args: unknown[]) => unknown;
  onPointerLeave?: (...args: unknown[]) => unknown;
  onPointerOver?: (...args: unknown[]) => unknown;
  onPointerOverCapture?: (...args: unknown[]) => unknown;
  onPointerOut?: (...args: unknown[]) => unknown;
  onPointerOutCapture?: (...args: unknown[]) => unknown;
  onGotPointerCapture?: (...args: unknown[]) => unknown;
  onGotPointerCaptureCapture?: (...args: unknown[]) => unknown;
  onLostPointerCapture?: (...args: unknown[]) => unknown;
  onLostPointerCaptureCapture?: (...args: unknown[]) => unknown;
  onScroll?: (...args: unknown[]) => unknown;
  onScrollCapture?: (...args: unknown[]) => unknown;
  onWheel?: (...args: unknown[]) => unknown;
  onWheelCapture?: (...args: unknown[]) => unknown;
  onAnimationStart?: (...args: unknown[]) => unknown;
  onAnimationStartCapture?: (...args: unknown[]) => unknown;
  onAnimationEnd?: (...args: unknown[]) => unknown;
  onAnimationEndCapture?: (...args: unknown[]) => unknown;
  onAnimationIteration?: (...args: unknown[]) => unknown;
  onAnimationIterationCapture?: (...args: unknown[]) => unknown;
  onTransitionEnd?: (...args: unknown[]) => unknown;
  onTransitionEndCapture?: (...args: unknown[]) => unknown;
};

export const TwentyUiCheckmarkElement = createRemoteElement<
  TwentyUiCheckmarkProperties,
  Record<string, never>,
  { children: true; 'data-tooltip-wrapper': true },
  Record<string, never>
>({
  slots: ['children', 'data-tooltip-wrapper'],
  properties: {
    slot: { type: String },
    style: { type: Object },
    title: { type: String },
    className: { type: String },
    onClick: { type: Function },
    color: { type: String },
    content: { type: String },
    translate: { type: String },
    hidden: { type: Boolean },
    'aria-label': { type: String },
    defaultChecked: { type: Boolean },
    suppressContentEditableWarning: { type: Boolean },
    suppressHydrationWarning: { type: Boolean },
    accessKey: { type: String },
    autoFocus: { type: Boolean },
    contentEditable: { type: String },
    contextMenu: { type: String },
    dir: { type: String },
    draggable: { type: String },
    id: { type: String },
    lang: { type: String },
    nonce: { type: String },
    spellCheck: { type: String },
    tabIndex: { type: Number },
    radioGroup: { type: String },
    about: { type: String },
    datatype: { type: String },
    prefix: { type: String },
    property: { type: String },
    rel: { type: String },
    resource: { type: String },
    rev: { type: String },
    typeof: { type: String },
    vocab: { type: String },
    autoCapitalize: { type: String },
    autoCorrect: { type: String },
    autoSave: { type: String },
    itemProp: { type: String },
    itemScope: { type: Boolean },
    itemType: { type: String },
    itemID: { type: String },
    itemRef: { type: String },
    results: { type: Number },
    security: { type: String },
    unselectable: { type: String },
    inputMode: { type: String },
    is: { type: String },
    'data-tooltip-id': { type: String },
    'data-tooltip-place': { type: String },
    'data-tooltip-content': { type: String },
    'data-tooltip-html': { type: String },
    'data-tooltip-variant': { type: String },
    'data-tooltip-offset': { type: Number },
    'data-tooltip-events': { type: Array },
    'data-tooltip-position-strategy': { type: String },
    'data-tooltip-delay-show': { type: Number },
    'data-tooltip-delay-hide': { type: Number },
    'data-tooltip-float': { type: Boolean },
    'data-tooltip-hidden': { type: Boolean },
    'data-tooltip-class-name': { type: String },
    'aria-activedescendant': { type: String },
    'aria-atomic': { type: String },
    'aria-autocomplete': { type: String },
    'aria-braillelabel': { type: String },
    'aria-brailleroledescription': { type: String },
    'aria-busy': { type: String },
    'aria-checked': { type: String },
    'aria-colcount': { type: Number },
    'aria-colindex': { type: Number },
    'aria-colindextext': { type: String },
    'aria-colspan': { type: Number },
    'aria-controls': { type: String },
    'aria-current': { type: String },
    'aria-describedby': { type: String },
    'aria-description': { type: String },
    'aria-details': { type: String },
    'aria-disabled': { type: String },
    'aria-dropeffect': { type: String },
    'aria-errormessage': { type: String },
    'aria-expanded': { type: String },
    'aria-flowto': { type: String },
    'aria-grabbed': { type: String },
    'aria-haspopup': { type: String },
    'aria-hidden': { type: String },
    'aria-invalid': { type: String },
    'aria-keyshortcuts': { type: String },
    'aria-labelledby': { type: String },
    'aria-level': { type: Number },
    'aria-live': { type: String },
    'aria-modal': { type: String },
    'aria-multiline': { type: String },
    'aria-multiselectable': { type: String },
    'aria-orientation': { type: String },
    'aria-owns': { type: String },
    'aria-placeholder': { type: String },
    'aria-posinset': { type: Number },
    'aria-pressed': { type: String },
    'aria-readonly': { type: String },
    'aria-relevant': { type: String },
    'aria-required': { type: String },
    'aria-roledescription': { type: String },
    'aria-rowcount': { type: Number },
    'aria-rowindex': { type: Number },
    'aria-rowindextext': { type: String },
    'aria-rowspan': { type: Number },
    'aria-selected': { type: String },
    'aria-setsize': { type: Number },
    'aria-sort': { type: String },
    'aria-valuemax': { type: Number },
    'aria-valuemin': { type: Number },
    'aria-valuenow': { type: Number },
    'aria-valuetext': { type: String },
    dangerouslySetInnerHTML: { type: Object },
    onCopy: { type: Function },
    onCopyCapture: { type: Function },
    onCut: { type: Function },
    onCutCapture: { type: Function },
    onPaste: { type: Function },
    onPasteCapture: { type: Function },
    onCompositionEnd: { type: Function },
    onCompositionEndCapture: { type: Function },
    onCompositionStart: { type: Function },
    onCompositionStartCapture: { type: Function },
    onCompositionUpdate: { type: Function },
    onCompositionUpdateCapture: { type: Function },
    onFocus: { type: Function },
    onFocusCapture: { type: Function },
    onBlur: { type: Function },
    onBlurCapture: { type: Function },
    onChange: { type: Function },
    onChangeCapture: { type: Function },
    onBeforeInput: { type: Function },
    onBeforeInputCapture: { type: Function },
    onInput: { type: Function },
    onInputCapture: { type: Function },
    onReset: { type: Function },
    onResetCapture: { type: Function },
    onSubmit: { type: Function },
    onSubmitCapture: { type: Function },
    onInvalid: { type: Function },
    onInvalidCapture: { type: Function },
    onLoad: { type: Function },
    onLoadCapture: { type: Function },
    onError: { type: Function },
    onErrorCapture: { type: Function },
    onKeyDown: { type: Function },
    onKeyDownCapture: { type: Function },
    onKeyPress: { type: Function },
    onKeyPressCapture: { type: Function },
    onKeyUp: { type: Function },
    onKeyUpCapture: { type: Function },
    onAbort: { type: Function },
    onAbortCapture: { type: Function },
    onCanPlay: { type: Function },
    onCanPlayCapture: { type: Function },
    onCanPlayThrough: { type: Function },
    onCanPlayThroughCapture: { type: Function },
    onDurationChange: { type: Function },
    onDurationChangeCapture: { type: Function },
    onEmptied: { type: Function },
    onEmptiedCapture: { type: Function },
    onEncrypted: { type: Function },
    onEncryptedCapture: { type: Function },
    onEnded: { type: Function },
    onEndedCapture: { type: Function },
    onLoadedData: { type: Function },
    onLoadedDataCapture: { type: Function },
    onLoadedMetadata: { type: Function },
    onLoadedMetadataCapture: { type: Function },
    onLoadStart: { type: Function },
    onLoadStartCapture: { type: Function },
    onPause: { type: Function },
    onPauseCapture: { type: Function },
    onPlay: { type: Function },
    onPlayCapture: { type: Function },
    onPlaying: { type: Function },
    onPlayingCapture: { type: Function },
    onProgress: { type: Function },
    onProgressCapture: { type: Function },
    onRateChange: { type: Function },
    onRateChangeCapture: { type: Function },
    onResize: { type: Function },
    onResizeCapture: { type: Function },
    onSeeked: { type: Function },
    onSeekedCapture: { type: Function },
    onSeeking: { type: Function },
    onSeekingCapture: { type: Function },
    onStalled: { type: Function },
    onStalledCapture: { type: Function },
    onSuspend: { type: Function },
    onSuspendCapture: { type: Function },
    onTimeUpdate: { type: Function },
    onTimeUpdateCapture: { type: Function },
    onVolumeChange: { type: Function },
    onVolumeChangeCapture: { type: Function },
    onWaiting: { type: Function },
    onWaitingCapture: { type: Function },
    onAuxClick: { type: Function },
    onAuxClickCapture: { type: Function },
    onClickCapture: { type: Function },
    onContextMenu: { type: Function },
    onContextMenuCapture: { type: Function },
    onDoubleClick: { type: Function },
    onDoubleClickCapture: { type: Function },
    onDrag: { type: Function },
    onDragCapture: { type: Function },
    onDragEnd: { type: Function },
    onDragEndCapture: { type: Function },
    onDragEnter: { type: Function },
    onDragEnterCapture: { type: Function },
    onDragExit: { type: Function },
    onDragExitCapture: { type: Function },
    onDragLeave: { type: Function },
    onDragLeaveCapture: { type: Function },
    onDragOver: { type: Function },
    onDragOverCapture: { type: Function },
    onDragStart: { type: Function },
    onDragStartCapture: { type: Function },
    onDrop: { type: Function },
    onDropCapture: { type: Function },
    onMouseDown: { type: Function },
    onMouseDownCapture: { type: Function },
    onMouseEnter: { type: Function },
    onMouseLeave: { type: Function },
    onMouseMove: { type: Function },
    onMouseMoveCapture: { type: Function },
    onMouseOut: { type: Function },
    onMouseOutCapture: { type: Function },
    onMouseOver: { type: Function },
    onMouseOverCapture: { type: Function },
    onMouseUp: { type: Function },
    onMouseUpCapture: { type: Function },
    onSelect: { type: Function },
    onSelectCapture: { type: Function },
    onTouchCancel: { type: Function },
    onTouchCancelCapture: { type: Function },
    onTouchEnd: { type: Function },
    onTouchEndCapture: { type: Function },
    onTouchMove: { type: Function },
    onTouchMoveCapture: { type: Function },
    onTouchStart: { type: Function },
    onTouchStartCapture: { type: Function },
    onPointerDown: { type: Function },
    onPointerDownCapture: { type: Function },
    onPointerMove: { type: Function },
    onPointerMoveCapture: { type: Function },
    onPointerUp: { type: Function },
    onPointerUpCapture: { type: Function },
    onPointerCancel: { type: Function },
    onPointerCancelCapture: { type: Function },
    onPointerEnter: { type: Function },
    onPointerLeave: { type: Function },
    onPointerOver: { type: Function },
    onPointerOverCapture: { type: Function },
    onPointerOut: { type: Function },
    onPointerOutCapture: { type: Function },
    onGotPointerCapture: { type: Function },
    onGotPointerCaptureCapture: { type: Function },
    onLostPointerCapture: { type: Function },
    onLostPointerCaptureCapture: { type: Function },
    onScroll: { type: Function },
    onScrollCapture: { type: Function },
    onWheel: { type: Function },
    onWheelCapture: { type: Function },
    onAnimationStart: { type: Function },
    onAnimationStartCapture: { type: Function },
    onAnimationEnd: { type: Function },
    onAnimationEndCapture: { type: Function },
    onAnimationIteration: { type: Function },
    onAnimationIterationCapture: { type: Function },
    onTransitionEnd: { type: Function },
    onTransitionEndCapture: { type: Function },
  },
});

export type TwentyUiColorSampleProperties = {
  colorName: string;
  color?: string;
  variant?: string;
};

export const TwentyUiColorSampleElement = createRemoteElement<
  TwentyUiColorSampleProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    colorName: { type: String },
    color: { type: String },
    variant: { type: String },
  },
});

export type TwentyUiCommandBlockProperties = {
  commands: unknown[];
};

export const TwentyUiCommandBlockElement = createRemoteElement<
  TwentyUiCommandBlockProperties,
  Record<string, never>,
  { button: true },
  Record<string, never>
>({
  slots: ['button'],
  properties: {
    commands: { type: Array },
  },
});

export type TwentyUiIconProperties = {
  className?: string;
  style?: Record<string, unknown>;
  size?: string;
  stroke?: string;
  color?: string;
  name: string;
};

export const TwentyUiIconElement = createRemoteElement<
  TwentyUiIconProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    className: { type: String },
    style: { type: Object },
    size: { type: String },
    stroke: { type: String },
    color: { type: String },
    name: { type: String },
  },
});

export type TwentyUiInfoProperties = {
  accent?: string;
  text: string;
  buttonTitle?: string;
  to?: string;
};

export const TwentyUiInfoElement = createRemoteElement<
  TwentyUiInfoProperties,
  Record<string, never>,
  Record<string, never>,
  { click(event: RemoteEvent<SerializedEventData>): void }
>({
  properties: {
    accent: { type: String },
    text: { type: String },
    buttonTitle: { type: String },
    to: { type: String },
  },
  events: ['click'],
});

export type TwentyUiStatusProperties = {
  className?: string;
  color: string;
  isLoaderVisible?: boolean;
  text: string;
  onClick?: (...args: unknown[]) => unknown;
  weight?: string;
};

export const TwentyUiStatusElement = createRemoteElement<
  TwentyUiStatusProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    className: { type: String },
    color: { type: String },
    isLoaderVisible: { type: Boolean },
    text: { type: String },
    onClick: { type: Function },
    weight: { type: String },
  },
});

export type TwentyUiHorizontalSeparatorProperties = {
  visible?: boolean;
  text?: string;
  noMargin?: boolean;
  color?: string;
};

export const TwentyUiHorizontalSeparatorElement = createRemoteElement<
  TwentyUiHorizontalSeparatorProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    visible: { type: Boolean },
    text: { type: String },
    noMargin: { type: Boolean },
    color: { type: String },
  },
});

export type TwentyUiAppTooltipProperties = {
  className?: string;
  anchorSelect?: string;
  content?: string;
  offset?: number;
  noArrow?: boolean;
  hidden?: boolean;
  place?: string;
  delay?: string;
  positionStrategy?: string;
  clickable?: boolean;
  width?: string;
  isOpen?: boolean;
};

export const TwentyUiAppTooltipElement = createRemoteElement<
  TwentyUiAppTooltipProperties,
  Record<string, never>,
  { children: true },
  Record<string, never>
>({
  slots: ['children'],
  properties: {
    className: { type: String },
    anchorSelect: { type: String },
    content: { type: String },
    offset: { type: Number },
    noArrow: { type: Boolean },
    hidden: { type: Boolean },
    place: { type: String },
    delay: { type: String },
    positionStrategy: { type: String },
    clickable: { type: Boolean },
    width: { type: String },
    isOpen: { type: Boolean },
  },
});

export type TwentyUiOverflowingTextWithTooltipProperties = {
  size?: string;
  isTooltipMultiline?: boolean;
  displayedMaxRows?: number;
  text?: string;
};

export const TwentyUiOverflowingTextWithTooltipElement = createRemoteElement<
  TwentyUiOverflowingTextWithTooltipProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    size: { type: String },
    isTooltipMultiline: { type: Boolean },
    displayedMaxRows: { type: Number },
    text: { type: String },
  },
});

export type TwentyUiH1TitleProperties = {
  fontColor?: string;
  className?: string;
};

export const TwentyUiH1TitleElement = createRemoteElement<
  TwentyUiH1TitleProperties,
  Record<string, never>,
  { title: true },
  Record<string, never>
>({
  slots: ['title'],
  properties: {
    fontColor: { type: String },
    className: { type: String },
  },
});

export type TwentyUiH2TitleProperties = {
  title: string;
  description?: string;
  className?: string;
};

export const TwentyUiH2TitleElement = createRemoteElement<
  TwentyUiH2TitleProperties,
  Record<string, never>,
  { adornment: true },
  Record<string, never>
>({
  slots: ['adornment'],
  properties: {
    title: { type: String },
    description: { type: String },
    className: { type: String },
  },
});

export type TwentyUiH3TitleProperties = {
  description?: string;
  className?: string;
};

export const TwentyUiH3TitleElement = createRemoteElement<
  TwentyUiH3TitleProperties,
  Record<string, never>,
  { title: true },
  Record<string, never>
>({
  slots: ['title'],
  properties: {
    description: { type: String },
    className: { type: String },
  },
});

export type TwentyUiLoaderProperties = {
  color?: string;
};

export const TwentyUiLoaderElement = createRemoteElement<
  TwentyUiLoaderProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    color: { type: String },
  },
});

export type TwentyUiCircularProgressBarProperties = {
  size?: number;
  barWidth?: number;
  barColor?: string;
};

export const TwentyUiCircularProgressBarElement = createRemoteElement<
  TwentyUiCircularProgressBarProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    size: { type: Number },
    barWidth: { type: Number },
    barColor: { type: String },
  },
});

export type TwentyUiProgressBarProperties = {
  value: number;
  className?: string;
  barColor?: string;
  backgroundColor?: string;
  withBorderRadius?: boolean;
};

export const TwentyUiProgressBarElement = createRemoteElement<
  TwentyUiProgressBarProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    value: { type: Number },
    className: { type: String },
    barColor: { type: String },
    backgroundColor: { type: String },
    withBorderRadius: { type: Boolean },
  },
});

export type TwentyUiAnimatedExpandableContainerProperties = {
  isExpanded: boolean;
  dimension?: string;
  mode?: string;
  containAnimation?: boolean;
  initial?: boolean;
};

export const TwentyUiAnimatedExpandableContainerElement = createRemoteElement<
  TwentyUiAnimatedExpandableContainerProperties,
  Record<string, never>,
  { children: true },
  Record<string, never>
>({
  slots: ['children'],
  properties: {
    isExpanded: { type: Boolean },
    dimension: { type: String },
    mode: { type: String },
    containAnimation: { type: Boolean },
    initial: { type: Boolean },
  },
});

export type TwentyUiAnimatedPlaceholderProperties = {
  type: string;
};

export const TwentyUiAnimatedPlaceholderElement = createRemoteElement<
  TwentyUiAnimatedPlaceholderProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    type: { type: String },
  },
});

export type TwentyUiSectionProperties = {
  className?: string;
  alignment?: string;
  fullWidth?: boolean;
  fontColor?: string;
};

export const TwentyUiSectionElement = createRemoteElement<
  TwentyUiSectionProperties,
  Record<string, never>,
  { children: true },
  Record<string, never>
>({
  slots: ['children'],
  properties: {
    className: { type: String },
    alignment: { type: String },
    fullWidth: { type: Boolean },
    fontColor: { type: String },
  },
});

export type TwentyUiAdvancedSettingsToggleProperties = {
  isAdvancedModeEnabled: boolean;
  setIsAdvancedModeEnabled: (...args: unknown[]) => unknown;
  label?: string;
};

export const TwentyUiAdvancedSettingsToggleElement = createRemoteElement<
  TwentyUiAdvancedSettingsToggleProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    isAdvancedModeEnabled: { type: Boolean },
    setIsAdvancedModeEnabled: { type: Function },
    label: { type: String },
  },
});

export type TwentyUiClickToActionLinkProperties = {
  href?: string;
  hrefLang?: string;
  media?: string;
  ping?: string;
  type?: string;
  referrerPolicy?: string;
  defaultChecked?: boolean;
  suppressContentEditableWarning?: boolean;
  suppressHydrationWarning?: boolean;
  accessKey?: string;
  autoFocus?: boolean;
  className?: string;
  contentEditable?: string;
  contextMenu?: string;
  dir?: string;
  draggable?: string;
  hidden?: boolean;
  id?: string;
  lang?: string;
  nonce?: string;
  slot?: string;
  spellCheck?: string;
  style?: Record<string, unknown>;
  tabIndex?: number;
  title?: string;
  translate?: string;
  radioGroup?: string;
  about?: string;
  content?: string;
  datatype?: string;
  prefix?: string;
  property?: string;
  rel?: string;
  resource?: string;
  rev?: string;
  typeof?: string;
  vocab?: string;
  autoCapitalize?: string;
  autoCorrect?: string;
  autoSave?: string;
  color?: string;
  itemProp?: string;
  itemScope?: boolean;
  itemType?: string;
  itemID?: string;
  itemRef?: string;
  results?: number;
  security?: string;
  unselectable?: string;
  inputMode?: string;
  is?: string;
  'data-tooltip-id'?: string;
  'data-tooltip-place'?: string;
  'data-tooltip-content'?: string;
  'data-tooltip-html'?: string;
  'data-tooltip-variant'?: string;
  'data-tooltip-offset'?: number;
  'data-tooltip-events'?: unknown[];
  'data-tooltip-position-strategy'?: string;
  'data-tooltip-delay-show'?: number;
  'data-tooltip-delay-hide'?: number;
  'data-tooltip-float'?: boolean;
  'data-tooltip-hidden'?: boolean;
  'data-tooltip-class-name'?: string;
  'aria-activedescendant'?: string;
  'aria-atomic'?: string;
  'aria-autocomplete'?: string;
  'aria-braillelabel'?: string;
  'aria-brailleroledescription'?: string;
  'aria-busy'?: string;
  'aria-checked'?: string;
  'aria-colcount'?: number;
  'aria-colindex'?: number;
  'aria-colindextext'?: string;
  'aria-colspan'?: number;
  'aria-controls'?: string;
  'aria-current'?: string;
  'aria-describedby'?: string;
  'aria-description'?: string;
  'aria-details'?: string;
  'aria-disabled'?: string;
  'aria-dropeffect'?: string;
  'aria-errormessage'?: string;
  'aria-expanded'?: string;
  'aria-flowto'?: string;
  'aria-grabbed'?: string;
  'aria-haspopup'?: string;
  'aria-hidden'?: string;
  'aria-invalid'?: string;
  'aria-keyshortcuts'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-level'?: number;
  'aria-live'?: string;
  'aria-modal'?: string;
  'aria-multiline'?: string;
  'aria-multiselectable'?: string;
  'aria-orientation'?: string;
  'aria-owns'?: string;
  'aria-placeholder'?: string;
  'aria-posinset'?: number;
  'aria-pressed'?: string;
  'aria-readonly'?: string;
  'aria-relevant'?: string;
  'aria-required'?: string;
  'aria-roledescription'?: string;
  'aria-rowcount'?: number;
  'aria-rowindex'?: number;
  'aria-rowindextext'?: string;
  'aria-rowspan'?: number;
  'aria-selected'?: string;
  'aria-setsize'?: number;
  'aria-sort'?: string;
  'aria-valuemax'?: number;
  'aria-valuemin'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  dangerouslySetInnerHTML?: Record<string, unknown>;
  onCopy?: (...args: unknown[]) => unknown;
  onCopyCapture?: (...args: unknown[]) => unknown;
  onCut?: (...args: unknown[]) => unknown;
  onCutCapture?: (...args: unknown[]) => unknown;
  onPaste?: (...args: unknown[]) => unknown;
  onPasteCapture?: (...args: unknown[]) => unknown;
  onCompositionEnd?: (...args: unknown[]) => unknown;
  onCompositionEndCapture?: (...args: unknown[]) => unknown;
  onCompositionStart?: (...args: unknown[]) => unknown;
  onCompositionStartCapture?: (...args: unknown[]) => unknown;
  onCompositionUpdate?: (...args: unknown[]) => unknown;
  onCompositionUpdateCapture?: (...args: unknown[]) => unknown;
  onFocus?: (...args: unknown[]) => unknown;
  onFocusCapture?: (...args: unknown[]) => unknown;
  onBlur?: (...args: unknown[]) => unknown;
  onBlurCapture?: (...args: unknown[]) => unknown;
  onChange?: (...args: unknown[]) => unknown;
  onChangeCapture?: (...args: unknown[]) => unknown;
  onBeforeInput?: (...args: unknown[]) => unknown;
  onBeforeInputCapture?: (...args: unknown[]) => unknown;
  onInput?: (...args: unknown[]) => unknown;
  onInputCapture?: (...args: unknown[]) => unknown;
  onReset?: (...args: unknown[]) => unknown;
  onResetCapture?: (...args: unknown[]) => unknown;
  onSubmit?: (...args: unknown[]) => unknown;
  onSubmitCapture?: (...args: unknown[]) => unknown;
  onInvalid?: (...args: unknown[]) => unknown;
  onInvalidCapture?: (...args: unknown[]) => unknown;
  onLoad?: (...args: unknown[]) => unknown;
  onLoadCapture?: (...args: unknown[]) => unknown;
  onError?: (...args: unknown[]) => unknown;
  onErrorCapture?: (...args: unknown[]) => unknown;
  onKeyDown?: (...args: unknown[]) => unknown;
  onKeyDownCapture?: (...args: unknown[]) => unknown;
  onKeyPress?: (...args: unknown[]) => unknown;
  onKeyPressCapture?: (...args: unknown[]) => unknown;
  onKeyUp?: (...args: unknown[]) => unknown;
  onKeyUpCapture?: (...args: unknown[]) => unknown;
  onAbort?: (...args: unknown[]) => unknown;
  onAbortCapture?: (...args: unknown[]) => unknown;
  onCanPlay?: (...args: unknown[]) => unknown;
  onCanPlayCapture?: (...args: unknown[]) => unknown;
  onCanPlayThrough?: (...args: unknown[]) => unknown;
  onCanPlayThroughCapture?: (...args: unknown[]) => unknown;
  onDurationChange?: (...args: unknown[]) => unknown;
  onDurationChangeCapture?: (...args: unknown[]) => unknown;
  onEmptied?: (...args: unknown[]) => unknown;
  onEmptiedCapture?: (...args: unknown[]) => unknown;
  onEncrypted?: (...args: unknown[]) => unknown;
  onEncryptedCapture?: (...args: unknown[]) => unknown;
  onEnded?: (...args: unknown[]) => unknown;
  onEndedCapture?: (...args: unknown[]) => unknown;
  onLoadedData?: (...args: unknown[]) => unknown;
  onLoadedDataCapture?: (...args: unknown[]) => unknown;
  onLoadedMetadata?: (...args: unknown[]) => unknown;
  onLoadedMetadataCapture?: (...args: unknown[]) => unknown;
  onLoadStart?: (...args: unknown[]) => unknown;
  onLoadStartCapture?: (...args: unknown[]) => unknown;
  onPause?: (...args: unknown[]) => unknown;
  onPauseCapture?: (...args: unknown[]) => unknown;
  onPlay?: (...args: unknown[]) => unknown;
  onPlayCapture?: (...args: unknown[]) => unknown;
  onPlaying?: (...args: unknown[]) => unknown;
  onPlayingCapture?: (...args: unknown[]) => unknown;
  onProgress?: (...args: unknown[]) => unknown;
  onProgressCapture?: (...args: unknown[]) => unknown;
  onRateChange?: (...args: unknown[]) => unknown;
  onRateChangeCapture?: (...args: unknown[]) => unknown;
  onResize?: (...args: unknown[]) => unknown;
  onResizeCapture?: (...args: unknown[]) => unknown;
  onSeeked?: (...args: unknown[]) => unknown;
  onSeekedCapture?: (...args: unknown[]) => unknown;
  onSeeking?: (...args: unknown[]) => unknown;
  onSeekingCapture?: (...args: unknown[]) => unknown;
  onStalled?: (...args: unknown[]) => unknown;
  onStalledCapture?: (...args: unknown[]) => unknown;
  onSuspend?: (...args: unknown[]) => unknown;
  onSuspendCapture?: (...args: unknown[]) => unknown;
  onTimeUpdate?: (...args: unknown[]) => unknown;
  onTimeUpdateCapture?: (...args: unknown[]) => unknown;
  onVolumeChange?: (...args: unknown[]) => unknown;
  onVolumeChangeCapture?: (...args: unknown[]) => unknown;
  onWaiting?: (...args: unknown[]) => unknown;
  onWaitingCapture?: (...args: unknown[]) => unknown;
  onAuxClick?: (...args: unknown[]) => unknown;
  onAuxClickCapture?: (...args: unknown[]) => unknown;
  onClick?: (...args: unknown[]) => unknown;
  onClickCapture?: (...args: unknown[]) => unknown;
  onContextMenu?: (...args: unknown[]) => unknown;
  onContextMenuCapture?: (...args: unknown[]) => unknown;
  onDoubleClick?: (...args: unknown[]) => unknown;
  onDoubleClickCapture?: (...args: unknown[]) => unknown;
  onDrag?: (...args: unknown[]) => unknown;
  onDragCapture?: (...args: unknown[]) => unknown;
  onDragEnd?: (...args: unknown[]) => unknown;
  onDragEndCapture?: (...args: unknown[]) => unknown;
  onDragEnter?: (...args: unknown[]) => unknown;
  onDragEnterCapture?: (...args: unknown[]) => unknown;
  onDragExit?: (...args: unknown[]) => unknown;
  onDragExitCapture?: (...args: unknown[]) => unknown;
  onDragLeave?: (...args: unknown[]) => unknown;
  onDragLeaveCapture?: (...args: unknown[]) => unknown;
  onDragOver?: (...args: unknown[]) => unknown;
  onDragOverCapture?: (...args: unknown[]) => unknown;
  onDragStart?: (...args: unknown[]) => unknown;
  onDragStartCapture?: (...args: unknown[]) => unknown;
  onDrop?: (...args: unknown[]) => unknown;
  onDropCapture?: (...args: unknown[]) => unknown;
  onMouseDown?: (...args: unknown[]) => unknown;
  onMouseDownCapture?: (...args: unknown[]) => unknown;
  onMouseEnter?: (...args: unknown[]) => unknown;
  onMouseLeave?: (...args: unknown[]) => unknown;
  onMouseMove?: (...args: unknown[]) => unknown;
  onMouseMoveCapture?: (...args: unknown[]) => unknown;
  onMouseOut?: (...args: unknown[]) => unknown;
  onMouseOutCapture?: (...args: unknown[]) => unknown;
  onMouseOver?: (...args: unknown[]) => unknown;
  onMouseOverCapture?: (...args: unknown[]) => unknown;
  onMouseUp?: (...args: unknown[]) => unknown;
  onMouseUpCapture?: (...args: unknown[]) => unknown;
  onSelect?: (...args: unknown[]) => unknown;
  onSelectCapture?: (...args: unknown[]) => unknown;
  onTouchCancel?: (...args: unknown[]) => unknown;
  onTouchCancelCapture?: (...args: unknown[]) => unknown;
  onTouchEnd?: (...args: unknown[]) => unknown;
  onTouchEndCapture?: (...args: unknown[]) => unknown;
  onTouchMove?: (...args: unknown[]) => unknown;
  onTouchMoveCapture?: (...args: unknown[]) => unknown;
  onTouchStart?: (...args: unknown[]) => unknown;
  onTouchStartCapture?: (...args: unknown[]) => unknown;
  onPointerDown?: (...args: unknown[]) => unknown;
  onPointerDownCapture?: (...args: unknown[]) => unknown;
  onPointerMove?: (...args: unknown[]) => unknown;
  onPointerMoveCapture?: (...args: unknown[]) => unknown;
  onPointerUp?: (...args: unknown[]) => unknown;
  onPointerUpCapture?: (...args: unknown[]) => unknown;
  onPointerCancel?: (...args: unknown[]) => unknown;
  onPointerCancelCapture?: (...args: unknown[]) => unknown;
  onPointerEnter?: (...args: unknown[]) => unknown;
  onPointerLeave?: (...args: unknown[]) => unknown;
  onPointerOver?: (...args: unknown[]) => unknown;
  onPointerOverCapture?: (...args: unknown[]) => unknown;
  onPointerOut?: (...args: unknown[]) => unknown;
  onPointerOutCapture?: (...args: unknown[]) => unknown;
  onGotPointerCapture?: (...args: unknown[]) => unknown;
  onGotPointerCaptureCapture?: (...args: unknown[]) => unknown;
  onLostPointerCapture?: (...args: unknown[]) => unknown;
  onLostPointerCaptureCapture?: (...args: unknown[]) => unknown;
  onScroll?: (...args: unknown[]) => unknown;
  onScrollCapture?: (...args: unknown[]) => unknown;
  onWheel?: (...args: unknown[]) => unknown;
  onWheelCapture?: (...args: unknown[]) => unknown;
  onAnimationStart?: (...args: unknown[]) => unknown;
  onAnimationStartCapture?: (...args: unknown[]) => unknown;
  onAnimationEnd?: (...args: unknown[]) => unknown;
  onAnimationEndCapture?: (...args: unknown[]) => unknown;
  onAnimationIteration?: (...args: unknown[]) => unknown;
  onAnimationIterationCapture?: (...args: unknown[]) => unknown;
  onTransitionEnd?: (...args: unknown[]) => unknown;
  onTransitionEndCapture?: (...args: unknown[]) => unknown;
};

export const TwentyUiClickToActionLinkElement = createRemoteElement<
  TwentyUiClickToActionLinkProperties,
  Record<string, never>,
  { 'data-tooltip-wrapper': true; children: true },
  Record<string, never>
>({
  slots: ['data-tooltip-wrapper', 'children'],
  properties: {
    href: { type: String },
    hrefLang: { type: String },
    media: { type: String },
    ping: { type: String },
    type: { type: String },
    referrerPolicy: { type: String },
    defaultChecked: { type: Boolean },
    suppressContentEditableWarning: { type: Boolean },
    suppressHydrationWarning: { type: Boolean },
    accessKey: { type: String },
    autoFocus: { type: Boolean },
    className: { type: String },
    contentEditable: { type: String },
    contextMenu: { type: String },
    dir: { type: String },
    draggable: { type: String },
    hidden: { type: Boolean },
    id: { type: String },
    lang: { type: String },
    nonce: { type: String },
    slot: { type: String },
    spellCheck: { type: String },
    style: { type: Object },
    tabIndex: { type: Number },
    title: { type: String },
    translate: { type: String },
    radioGroup: { type: String },
    about: { type: String },
    content: { type: String },
    datatype: { type: String },
    prefix: { type: String },
    property: { type: String },
    rel: { type: String },
    resource: { type: String },
    rev: { type: String },
    typeof: { type: String },
    vocab: { type: String },
    autoCapitalize: { type: String },
    autoCorrect: { type: String },
    autoSave: { type: String },
    color: { type: String },
    itemProp: { type: String },
    itemScope: { type: Boolean },
    itemType: { type: String },
    itemID: { type: String },
    itemRef: { type: String },
    results: { type: Number },
    security: { type: String },
    unselectable: { type: String },
    inputMode: { type: String },
    is: { type: String },
    'data-tooltip-id': { type: String },
    'data-tooltip-place': { type: String },
    'data-tooltip-content': { type: String },
    'data-tooltip-html': { type: String },
    'data-tooltip-variant': { type: String },
    'data-tooltip-offset': { type: Number },
    'data-tooltip-events': { type: Array },
    'data-tooltip-position-strategy': { type: String },
    'data-tooltip-delay-show': { type: Number },
    'data-tooltip-delay-hide': { type: Number },
    'data-tooltip-float': { type: Boolean },
    'data-tooltip-hidden': { type: Boolean },
    'data-tooltip-class-name': { type: String },
    'aria-activedescendant': { type: String },
    'aria-atomic': { type: String },
    'aria-autocomplete': { type: String },
    'aria-braillelabel': { type: String },
    'aria-brailleroledescription': { type: String },
    'aria-busy': { type: String },
    'aria-checked': { type: String },
    'aria-colcount': { type: Number },
    'aria-colindex': { type: Number },
    'aria-colindextext': { type: String },
    'aria-colspan': { type: Number },
    'aria-controls': { type: String },
    'aria-current': { type: String },
    'aria-describedby': { type: String },
    'aria-description': { type: String },
    'aria-details': { type: String },
    'aria-disabled': { type: String },
    'aria-dropeffect': { type: String },
    'aria-errormessage': { type: String },
    'aria-expanded': { type: String },
    'aria-flowto': { type: String },
    'aria-grabbed': { type: String },
    'aria-haspopup': { type: String },
    'aria-hidden': { type: String },
    'aria-invalid': { type: String },
    'aria-keyshortcuts': { type: String },
    'aria-label': { type: String },
    'aria-labelledby': { type: String },
    'aria-level': { type: Number },
    'aria-live': { type: String },
    'aria-modal': { type: String },
    'aria-multiline': { type: String },
    'aria-multiselectable': { type: String },
    'aria-orientation': { type: String },
    'aria-owns': { type: String },
    'aria-placeholder': { type: String },
    'aria-posinset': { type: Number },
    'aria-pressed': { type: String },
    'aria-readonly': { type: String },
    'aria-relevant': { type: String },
    'aria-required': { type: String },
    'aria-roledescription': { type: String },
    'aria-rowcount': { type: Number },
    'aria-rowindex': { type: Number },
    'aria-rowindextext': { type: String },
    'aria-rowspan': { type: Number },
    'aria-selected': { type: String },
    'aria-setsize': { type: Number },
    'aria-sort': { type: String },
    'aria-valuemax': { type: Number },
    'aria-valuemin': { type: Number },
    'aria-valuenow': { type: Number },
    'aria-valuetext': { type: String },
    dangerouslySetInnerHTML: { type: Object },
    onCopy: { type: Function },
    onCopyCapture: { type: Function },
    onCut: { type: Function },
    onCutCapture: { type: Function },
    onPaste: { type: Function },
    onPasteCapture: { type: Function },
    onCompositionEnd: { type: Function },
    onCompositionEndCapture: { type: Function },
    onCompositionStart: { type: Function },
    onCompositionStartCapture: { type: Function },
    onCompositionUpdate: { type: Function },
    onCompositionUpdateCapture: { type: Function },
    onFocus: { type: Function },
    onFocusCapture: { type: Function },
    onBlur: { type: Function },
    onBlurCapture: { type: Function },
    onChange: { type: Function },
    onChangeCapture: { type: Function },
    onBeforeInput: { type: Function },
    onBeforeInputCapture: { type: Function },
    onInput: { type: Function },
    onInputCapture: { type: Function },
    onReset: { type: Function },
    onResetCapture: { type: Function },
    onSubmit: { type: Function },
    onSubmitCapture: { type: Function },
    onInvalid: { type: Function },
    onInvalidCapture: { type: Function },
    onLoad: { type: Function },
    onLoadCapture: { type: Function },
    onError: { type: Function },
    onErrorCapture: { type: Function },
    onKeyDown: { type: Function },
    onKeyDownCapture: { type: Function },
    onKeyPress: { type: Function },
    onKeyPressCapture: { type: Function },
    onKeyUp: { type: Function },
    onKeyUpCapture: { type: Function },
    onAbort: { type: Function },
    onAbortCapture: { type: Function },
    onCanPlay: { type: Function },
    onCanPlayCapture: { type: Function },
    onCanPlayThrough: { type: Function },
    onCanPlayThroughCapture: { type: Function },
    onDurationChange: { type: Function },
    onDurationChangeCapture: { type: Function },
    onEmptied: { type: Function },
    onEmptiedCapture: { type: Function },
    onEncrypted: { type: Function },
    onEncryptedCapture: { type: Function },
    onEnded: { type: Function },
    onEndedCapture: { type: Function },
    onLoadedData: { type: Function },
    onLoadedDataCapture: { type: Function },
    onLoadedMetadata: { type: Function },
    onLoadedMetadataCapture: { type: Function },
    onLoadStart: { type: Function },
    onLoadStartCapture: { type: Function },
    onPause: { type: Function },
    onPauseCapture: { type: Function },
    onPlay: { type: Function },
    onPlayCapture: { type: Function },
    onPlaying: { type: Function },
    onPlayingCapture: { type: Function },
    onProgress: { type: Function },
    onProgressCapture: { type: Function },
    onRateChange: { type: Function },
    onRateChangeCapture: { type: Function },
    onResize: { type: Function },
    onResizeCapture: { type: Function },
    onSeeked: { type: Function },
    onSeekedCapture: { type: Function },
    onSeeking: { type: Function },
    onSeekingCapture: { type: Function },
    onStalled: { type: Function },
    onStalledCapture: { type: Function },
    onSuspend: { type: Function },
    onSuspendCapture: { type: Function },
    onTimeUpdate: { type: Function },
    onTimeUpdateCapture: { type: Function },
    onVolumeChange: { type: Function },
    onVolumeChangeCapture: { type: Function },
    onWaiting: { type: Function },
    onWaitingCapture: { type: Function },
    onAuxClick: { type: Function },
    onAuxClickCapture: { type: Function },
    onClick: { type: Function },
    onClickCapture: { type: Function },
    onContextMenu: { type: Function },
    onContextMenuCapture: { type: Function },
    onDoubleClick: { type: Function },
    onDoubleClickCapture: { type: Function },
    onDrag: { type: Function },
    onDragCapture: { type: Function },
    onDragEnd: { type: Function },
    onDragEndCapture: { type: Function },
    onDragEnter: { type: Function },
    onDragEnterCapture: { type: Function },
    onDragExit: { type: Function },
    onDragExitCapture: { type: Function },
    onDragLeave: { type: Function },
    onDragLeaveCapture: { type: Function },
    onDragOver: { type: Function },
    onDragOverCapture: { type: Function },
    onDragStart: { type: Function },
    onDragStartCapture: { type: Function },
    onDrop: { type: Function },
    onDropCapture: { type: Function },
    onMouseDown: { type: Function },
    onMouseDownCapture: { type: Function },
    onMouseEnter: { type: Function },
    onMouseLeave: { type: Function },
    onMouseMove: { type: Function },
    onMouseMoveCapture: { type: Function },
    onMouseOut: { type: Function },
    onMouseOutCapture: { type: Function },
    onMouseOver: { type: Function },
    onMouseOverCapture: { type: Function },
    onMouseUp: { type: Function },
    onMouseUpCapture: { type: Function },
    onSelect: { type: Function },
    onSelectCapture: { type: Function },
    onTouchCancel: { type: Function },
    onTouchCancelCapture: { type: Function },
    onTouchEnd: { type: Function },
    onTouchEndCapture: { type: Function },
    onTouchMove: { type: Function },
    onTouchMoveCapture: { type: Function },
    onTouchStart: { type: Function },
    onTouchStartCapture: { type: Function },
    onPointerDown: { type: Function },
    onPointerDownCapture: { type: Function },
    onPointerMove: { type: Function },
    onPointerMoveCapture: { type: Function },
    onPointerUp: { type: Function },
    onPointerUpCapture: { type: Function },
    onPointerCancel: { type: Function },
    onPointerCancelCapture: { type: Function },
    onPointerEnter: { type: Function },
    onPointerLeave: { type: Function },
    onPointerOver: { type: Function },
    onPointerOverCapture: { type: Function },
    onPointerOut: { type: Function },
    onPointerOutCapture: { type: Function },
    onGotPointerCapture: { type: Function },
    onGotPointerCaptureCapture: { type: Function },
    onLostPointerCapture: { type: Function },
    onLostPointerCaptureCapture: { type: Function },
    onScroll: { type: Function },
    onScrollCapture: { type: Function },
    onWheel: { type: Function },
    onWheelCapture: { type: Function },
    onAnimationStart: { type: Function },
    onAnimationStartCapture: { type: Function },
    onAnimationEnd: { type: Function },
    onAnimationEndCapture: { type: Function },
    onAnimationIteration: { type: Function },
    onAnimationIterationCapture: { type: Function },
    onTransitionEnd: { type: Function },
    onTransitionEndCapture: { type: Function },
  },
});

export type TwentyUiContactLinkProperties = {
  href: string;
  maxWidth?: number;
};

export const TwentyUiContactLinkElement = createRemoteElement<
  TwentyUiContactLinkProperties,
  Record<string, never>,
  { children: true },
  { click(event: RemoteEvent<SerializedEventData>): void }
>({
  slots: ['children'],
  properties: {
    href: { type: String },
    maxWidth: { type: Number },
  },
  events: ['click'],
});

export type TwentyUiGithubVersionLinkProperties = {
  version: string;
};

export const TwentyUiGithubVersionLinkElement = createRemoteElement<
  TwentyUiGithubVersionLinkProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    version: { type: String },
  },
});

export type TwentyUiRawLinkProperties = {
  className?: string;
  href: string;
};

export const TwentyUiRawLinkElement = createRemoteElement<
  TwentyUiRawLinkProperties,
  Record<string, never>,
  { children: true },
  { click(event: RemoteEvent<SerializedEventData>): void }
>({
  slots: ['children'],
  properties: {
    className: { type: String },
    href: { type: String },
  },
  events: ['click'],
});

export type TwentyUiRoundedLinkProperties = {
  href: string;
  label?: string;
  className?: string;
};

export const TwentyUiRoundedLinkElement = createRemoteElement<
  TwentyUiRoundedLinkProperties,
  Record<string, never>,
  Record<string, never>,
  { click(event: RemoteEvent<SerializedEventData>): void }
>({
  properties: {
    href: { type: String },
    label: { type: String },
    className: { type: String },
  },
  events: ['click'],
});

export type TwentyUiSocialLinkProperties = {
  label: string;
  href: string;
  type: string;
};

export const TwentyUiSocialLinkElement = createRemoteElement<
  TwentyUiSocialLinkProperties,
  Record<string, never>,
  Record<string, never>,
  { click(event: RemoteEvent<SerializedEventData>): void }
>({
  properties: {
    label: { type: String },
    href: { type: String },
    type: { type: String },
  },
  events: ['click'],
});

export type TwentyUiUndecoratedLinkProperties = {
  to: string;
  replace?: boolean;
  onClick?: (...args: unknown[]) => unknown;
  fullWidth?: boolean;
};

export const TwentyUiUndecoratedLinkElement = createRemoteElement<
  TwentyUiUndecoratedLinkProperties,
  Record<string, never>,
  { children: true },
  Record<string, never>
>({
  slots: ['children'],
  properties: {
    to: { type: String },
    replace: { type: Boolean },
    onClick: { type: Function },
    fullWidth: { type: Boolean },
  },
});

export type TwentyUiMenuPickerProperties = {
  id: string;
  className?: string;
  disabled?: boolean;
  label?: string;
  onClick?: (...args: unknown[]) => unknown;
  selected?: boolean;
  showLabel?: boolean;
  testId?: string;
  tooltipContent?: string;
  tooltipDelay?: string;
  tooltipOffset?: number;
};

export const TwentyUiMenuPickerElement = createRemoteElement<
  TwentyUiMenuPickerProperties,
  Record<string, never>,
  { icon: true },
  Record<string, never>
>({
  slots: ['icon'],
  properties: {
    id: { type: String },
    className: { type: String },
    disabled: { type: Boolean },
    label: { type: String },
    onClick: { type: Function },
    selected: { type: Boolean },
    showLabel: { type: Boolean },
    testId: { type: String },
    tooltipContent: { type: String },
    tooltipDelay: { type: String },
    tooltipOffset: { type: Number },
  },
});

export type TwentyUiMenuItemProperties = {
  accent?: string;
  className?: string;
  withIconContainer?: boolean;
  iconButtons?: unknown[];
  isIconDisplayedOnHoverOnly?: boolean;
  isTooltipOpen?: boolean;
  testId?: string;
  disabled?: boolean;
  contextualTextPosition?: string;
  hasSubMenu?: boolean;
  focused?: boolean;
  hotKeys?: unknown[];
  isSubMenuOpened?: boolean;
};

export const TwentyUiMenuItemElement = createRemoteElement<
  TwentyUiMenuItemProperties,
  Record<string, never>,
  {
    LeftIcon: true;
    LeftComponent: true;
    RightIcon: true;
    RightComponent: true;
    text: true;
    contextualText: true;
  },
  {
    click(event: RemoteEvent<SerializedEventData>): void;
    mouseenter(event: RemoteEvent<SerializedEventData>): void;
    mouseleave(event: RemoteEvent<SerializedEventData>): void;
  }
>({
  slots: [
    'LeftIcon',
    'LeftComponent',
    'RightIcon',
    'RightComponent',
    'text',
    'contextualText',
  ],
  properties: {
    accent: { type: String },
    className: { type: String },
    withIconContainer: { type: Boolean },
    iconButtons: { type: Array },
    isIconDisplayedOnHoverOnly: { type: Boolean },
    isTooltipOpen: { type: Boolean },
    testId: { type: String },
    disabled: { type: Boolean },
    contextualTextPosition: { type: String },
    hasSubMenu: { type: Boolean },
    focused: { type: Boolean },
    hotKeys: { type: Array },
    isSubMenuOpened: { type: Boolean },
  },
  events: ['click', 'mouseenter', 'mouseleave'],
});

export type TwentyUiMenuItemAvatarProperties = {
  accent?: string;
  className?: string;
  iconButtons?: unknown[];
  isIconDisplayedOnHoverOnly?: boolean;
  isTooltipOpen?: boolean;
  avatar?: Record<string, unknown>;
  testId?: string;
  text: string;
  hasSubMenu?: boolean;
};

export const TwentyUiMenuItemAvatarElement = createRemoteElement<
  TwentyUiMenuItemAvatarProperties,
  Record<string, never>,
  { contextualText: true },
  {
    click(event: RemoteEvent<SerializedEventData>): void;
    mouseenter(event: RemoteEvent<SerializedEventData>): void;
    mouseleave(event: RemoteEvent<SerializedEventData>): void;
  }
>({
  slots: ['contextualText'],
  properties: {
    accent: { type: String },
    className: { type: String },
    iconButtons: { type: Array },
    isIconDisplayedOnHoverOnly: { type: Boolean },
    isTooltipOpen: { type: Boolean },
    avatar: { type: Object },
    testId: { type: String },
    text: { type: String },
    hasSubMenu: { type: Boolean },
  },
  events: ['click', 'mouseenter', 'mouseleave'],
});

export type TwentyUiMenuItemDraggableProperties = {
  withIconContainer?: boolean;
  accent?: string;
  iconButtons?: unknown[];
  isTooltipOpen?: boolean;
  onClick?: (...args: unknown[]) => unknown;
  className?: string;
  isIconDisplayedOnHoverOnly?: boolean;
  gripMode?: string;
  isDragDisabled?: boolean;
  isHoverDisabled?: boolean;
};

export const TwentyUiMenuItemDraggableElement = createRemoteElement<
  TwentyUiMenuItemDraggableProperties,
  Record<string, never>,
  { LeftIcon: true; text: true },
  Record<string, never>
>({
  slots: ['LeftIcon', 'text'],
  properties: {
    withIconContainer: { type: Boolean },
    accent: { type: String },
    iconButtons: { type: Array },
    isTooltipOpen: { type: Boolean },
    onClick: { type: Function },
    className: { type: String },
    isIconDisplayedOnHoverOnly: { type: Boolean },
    gripMode: { type: String },
    isDragDisabled: { type: Boolean },
    isHoverDisabled: { type: Boolean },
  },
});

export type TwentyUiMenuItemHotKeysProperties = {
  hotKeys?: unknown[];
  joinLabel?: string;
};

export const TwentyUiMenuItemHotKeysElement = createRemoteElement<
  TwentyUiMenuItemHotKeysProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    hotKeys: { type: Array },
    joinLabel: { type: String },
  },
});

export type TwentyUiMenuItemMultiSelectProperties = {
  color?: string;
  selected: boolean;
  isKeySelected?: boolean;
  withIconContainer?: boolean;
  text: string;
  className: string;
  onSelectChange?: (...args: unknown[]) => unknown;
};

export const TwentyUiMenuItemMultiSelectElement = createRemoteElement<
  TwentyUiMenuItemMultiSelectProperties,
  Record<string, never>,
  { LeftIcon: true },
  Record<string, never>
>({
  slots: ['LeftIcon'],
  properties: {
    color: { type: String },
    selected: { type: Boolean },
    isKeySelected: { type: Boolean },
    withIconContainer: { type: Boolean },
    text: { type: String },
    className: { type: String },
    onSelectChange: { type: Function },
  },
});

export type TwentyUiMenuItemMultiSelectAvatarProperties = {
  selected: boolean;
  isKeySelected?: boolean;
  text?: string;
  contextualText?: string;
  className?: string;
  onSelectChange?: (...args: unknown[]) => unknown;
};

export const TwentyUiMenuItemMultiSelectAvatarElement = createRemoteElement<
  TwentyUiMenuItemMultiSelectAvatarProperties,
  Record<string, never>,
  { avatar: true },
  Record<string, never>
>({
  slots: ['avatar'],
  properties: {
    selected: { type: Boolean },
    isKeySelected: { type: Boolean },
    text: { type: String },
    contextualText: { type: String },
    className: { type: String },
    onSelectChange: { type: Function },
  },
});

export type TwentyUiMenuItemMultiSelectTagProperties = {
  selected: boolean;
  className?: string;
  isKeySelected?: boolean;
  onClick?: (...args: unknown[]) => unknown;
  color: string;
  text: string;
};

export const TwentyUiMenuItemMultiSelectTagElement = createRemoteElement<
  TwentyUiMenuItemMultiSelectTagProperties,
  Record<string, never>,
  { Icon: true },
  Record<string, never>
>({
  slots: ['Icon'],
  properties: {
    selected: { type: Boolean },
    className: { type: String },
    isKeySelected: { type: Boolean },
    onClick: { type: Function },
    color: { type: String },
    text: { type: String },
  },
});

export type TwentyUiMenuItemNavigateProperties = {
  withIconContainer?: boolean;
  text: string;
  onClick?: (...args: unknown[]) => unknown;
  className?: string;
};

export const TwentyUiMenuItemNavigateElement = createRemoteElement<
  TwentyUiMenuItemNavigateProperties,
  Record<string, never>,
  { LeftIcon: true },
  Record<string, never>
>({
  slots: ['LeftIcon'],
  properties: {
    withIconContainer: { type: Boolean },
    text: { type: String },
    onClick: { type: Function },
    className: { type: String },
  },
});

export type TwentyUiMenuItemSelectProperties = {
  withIconContainer?: boolean;
  selected: boolean;
  needIconCheck?: boolean;
  text: string;
  className?: string;
  onClick?: (...args: unknown[]) => unknown;
  disabled?: boolean;
  focused?: boolean;
  hasSubMenu?: boolean;
  contextualTextPosition?: string;
};

export const TwentyUiMenuItemSelectElement = createRemoteElement<
  TwentyUiMenuItemSelectProperties,
  Record<string, never>,
  { LeftIcon: true; contextualText: true },
  Record<string, never>
>({
  slots: ['LeftIcon', 'contextualText'],
  properties: {
    withIconContainer: { type: Boolean },
    selected: { type: Boolean },
    needIconCheck: { type: Boolean },
    text: { type: String },
    className: { type: String },
    onClick: { type: Function },
    disabled: { type: Boolean },
    focused: { type: Boolean },
    hasSubMenu: { type: Boolean },
    contextualTextPosition: { type: String },
  },
});

export type TwentyUiMenuItemSelectAvatarProperties = {
  selected: boolean;
  text: string;
  contextualText?: string;
  className?: string;
  onClick?: (...args: unknown[]) => unknown;
  disabled?: boolean;
  focused?: boolean;
  testId?: string;
};

export const TwentyUiMenuItemSelectAvatarElement = createRemoteElement<
  TwentyUiMenuItemSelectAvatarProperties,
  Record<string, never>,
  { avatar: true },
  Record<string, never>
>({
  slots: ['avatar'],
  properties: {
    selected: { type: Boolean },
    text: { type: String },
    contextualText: { type: String },
    className: { type: String },
    onClick: { type: Function },
    disabled: { type: Boolean },
    focused: { type: Boolean },
    testId: { type: String },
  },
});

export type TwentyUiMenuItemSelectColorProperties = {
  selected: boolean;
  className?: string;
  onClick?: (...args: unknown[]) => unknown;
  disabled?: boolean;
  focused?: boolean;
  color: string;
  variant?: string;
  colorLabels?: Record<string, unknown>;
};

export const TwentyUiMenuItemSelectColorElement = createRemoteElement<
  TwentyUiMenuItemSelectColorProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    selected: { type: Boolean },
    className: { type: String },
    onClick: { type: Function },
    disabled: { type: Boolean },
    focused: { type: Boolean },
    color: { type: String },
    variant: { type: String },
    colorLabels: { type: Object },
  },
});

export type TwentyUiMenuItemSelectTagProperties = {
  selected?: boolean;
  focused?: boolean;
  isKeySelected?: boolean;
  className?: string;
  onClick?: (...args: unknown[]) => unknown;
  color: string;
  text: string;
  variant?: string;
};

export const TwentyUiMenuItemSelectTagElement = createRemoteElement<
  TwentyUiMenuItemSelectTagProperties,
  Record<string, never>,
  { LeftIcon: true },
  Record<string, never>
>({
  slots: ['LeftIcon'],
  properties: {
    selected: { type: Boolean },
    focused: { type: Boolean },
    isKeySelected: { type: Boolean },
    className: { type: String },
    onClick: { type: Function },
    color: { type: String },
    text: { type: String },
    variant: { type: String },
  },
});

export type TwentyUiMenuItemSuggestionProperties = {
  withIconContainer?: boolean;
  text: string;
  selected?: boolean;
  className?: string;
};

export const TwentyUiMenuItemSuggestionElement = createRemoteElement<
  TwentyUiMenuItemSuggestionProperties,
  Record<string, never>,
  { LeftIcon: true },
  { click(event: RemoteEvent<SerializedEventData>): void }
>({
  slots: ['LeftIcon'],
  properties: {
    withIconContainer: { type: Boolean },
    text: { type: String },
    selected: { type: Boolean },
    className: { type: String },
  },
  events: ['click'],
});

export type TwentyUiMenuItemToggleProperties = {
  focused?: boolean;
  withIconContainer?: boolean;
  toggled: boolean;
  text: string;
  className?: string;
  onToggleChange?: (...args: unknown[]) => unknown;
  toggleSize?: string;
  disabled?: boolean;
};

export const TwentyUiMenuItemToggleElement = createRemoteElement<
  TwentyUiMenuItemToggleProperties,
  Record<string, never>,
  { LeftIcon: true },
  Record<string, never>
>({
  slots: ['LeftIcon'],
  properties: {
    focused: { type: Boolean },
    withIconContainer: { type: Boolean },
    toggled: { type: Boolean },
    text: { type: String },
    className: { type: String },
    onToggleChange: { type: Function },
    toggleSize: { type: String },
    disabled: { type: Boolean },
  },
});

export type TwentyUiMenuItemIconProperties = {
  withContainer?: boolean;
};

export const TwentyUiMenuItemIconElement = createRemoteElement<
  TwentyUiMenuItemIconProperties,
  Record<string, never>,
  { Icon: true },
  Record<string, never>
>({
  slots: ['Icon'],
  properties: {
    withContainer: { type: Boolean },
  },
});

export type TwentyUiMenuItemIconWithGripSwapProperties = {
  withIconContainer?: boolean;
  gripIconColor: string;
};

export const TwentyUiMenuItemIconWithGripSwapElement = createRemoteElement<
  TwentyUiMenuItemIconWithGripSwapProperties,
  Record<string, never>,
  { LeftIcon: true },
  Record<string, never>
>({
  slots: ['LeftIcon'],
  properties: {
    withIconContainer: { type: Boolean },
    gripIconColor: { type: String },
  },
});

export type TwentyUiMenuItemLeftContentProperties = {
  className?: string;
  withIconContainer?: boolean;
  gripMode?: string;
  disabled?: boolean;
  contextualTextPosition?: string;
};

export const TwentyUiMenuItemLeftContentElement = createRemoteElement<
  TwentyUiMenuItemLeftContentProperties,
  Record<string, never>,
  { LeftComponent: true; LeftIcon: true; text: true; contextualText: true },
  Record<string, never>
>({
  slots: ['LeftComponent', 'LeftIcon', 'text', 'contextualText'],
  properties: {
    className: { type: String },
    withIconContainer: { type: Boolean },
    gripMode: { type: String },
    disabled: { type: Boolean },
    contextualTextPosition: { type: String },
  },
});

export type TwentyUiNavigationBarProperties = {
  activeItemName: string;
  items: unknown[];
};

export const TwentyUiNavigationBarElement = createRemoteElement<
  TwentyUiNavigationBarProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    activeItemName: { type: String },
    items: { type: Array },
  },
});

export type TwentyUiNavigationBarItemProperties = {
  isActive: boolean;
  onClick: (...args: unknown[]) => unknown;
};

export const TwentyUiNavigationBarItemElement = createRemoteElement<
  TwentyUiNavigationBarItemProperties,
  Record<string, never>,
  { Icon: true },
  Record<string, never>
>({
  slots: ['Icon'],
  properties: {
    isActive: { type: Boolean },
    onClick: { type: Function },
  },
});

export type TwentyUiNotificationCounterProperties = {
  count: number;
  variant?: string;
  className?: string;
};

export const TwentyUiNotificationCounterElement = createRemoteElement<
  TwentyUiNotificationCounterProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    count: { type: Number },
    variant: { type: String },
    className: { type: String },
  },
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
customElements.define(
  'twenty-ui-animated-button',
  TwentyUiAnimatedButtonElement,
);
customElements.define(
  'twenty-ui-animated-light-icon-button',
  TwentyUiAnimatedLightIconButtonElement,
);
customElements.define('twenty-ui-button', TwentyUiButtonElement);
customElements.define('twenty-ui-button-group', TwentyUiButtonGroupElement);
customElements.define(
  'twenty-ui-color-picker-button',
  TwentyUiColorPickerButtonElement,
);
customElements.define(
  'twenty-ui-floating-button',
  TwentyUiFloatingButtonElement,
);
customElements.define(
  'twenty-ui-floating-button-group',
  TwentyUiFloatingButtonGroupElement,
);
customElements.define(
  'twenty-ui-floating-icon-button',
  TwentyUiFloatingIconButtonElement,
);
customElements.define(
  'twenty-ui-floating-icon-button-group',
  TwentyUiFloatingIconButtonGroupElement,
);
customElements.define('twenty-ui-inside-button', TwentyUiInsideButtonElement);
customElements.define('twenty-ui-light-button', TwentyUiLightButtonElement);
customElements.define(
  'twenty-ui-light-icon-button',
  TwentyUiLightIconButtonElement,
);
customElements.define(
  'twenty-ui-light-icon-button-group',
  TwentyUiLightIconButtonGroupElement,
);
customElements.define('twenty-ui-main-button', TwentyUiMainButtonElement);
customElements.define(
  'twenty-ui-rounded-icon-button',
  TwentyUiRoundedIconButtonElement,
);
customElements.define('twenty-ui-tab-content', TwentyUiTabContentElement);
customElements.define('twenty-ui-tab-button', TwentyUiTabButtonElement);
customElements.define('twenty-ui-code-editor', TwentyUiCodeEditorElement);
customElements.define(
  'twenty-ui-core-editor-header',
  TwentyUiCoreEditorHeaderElement,
);
customElements.define(
  'twenty-ui-color-scheme-card',
  TwentyUiColorSchemeCardElement,
);
customElements.define(
  'twenty-ui-color-scheme-picker',
  TwentyUiColorSchemePickerElement,
);
customElements.define('twenty-ui-card-picker', TwentyUiCardPickerElement);
customElements.define('twenty-ui-checkbox', TwentyUiCheckboxElement);
customElements.define('twenty-ui-radio', TwentyUiRadioElement);
customElements.define('twenty-ui-radio-group', TwentyUiRadioGroupElement);
customElements.define('twenty-ui-search-input', TwentyUiSearchInputElement);
customElements.define('twenty-ui-toggle', TwentyUiToggleElement);
customElements.define('twenty-ui-avatar-chip', TwentyUiAvatarChipElement);
customElements.define(
  'twenty-ui-multiple-avatar-chip',
  TwentyUiMultipleAvatarChipElement,
);
customElements.define('twenty-ui-chip', TwentyUiChipElement);
customElements.define('twenty-ui-link-chip', TwentyUiLinkChipElement);
customElements.define('twenty-ui-pill', TwentyUiPillElement);
customElements.define('twenty-ui-tag', TwentyUiTagElement);
customElements.define('twenty-ui-avatar', TwentyUiAvatarElement);
customElements.define('twenty-ui-avatar-group', TwentyUiAvatarGroupElement);
customElements.define('twenty-ui-banner', TwentyUiBannerElement);
customElements.define(
  'twenty-ui-side-panel-information-banner',
  TwentyUiSidePanelInformationBannerElement,
);
customElements.define('twenty-ui-callout', TwentyUiCalloutElement);
customElements.define(
  'twenty-ui-animated-checkmark',
  TwentyUiAnimatedCheckmarkElement,
);
customElements.define('twenty-ui-checkmark', TwentyUiCheckmarkElement);
customElements.define('twenty-ui-color-sample', TwentyUiColorSampleElement);
customElements.define('twenty-ui-command-block', TwentyUiCommandBlockElement);
customElements.define('twenty-ui-icon', TwentyUiIconElement);
customElements.define('twenty-ui-info', TwentyUiInfoElement);
customElements.define('twenty-ui-status', TwentyUiStatusElement);
customElements.define(
  'twenty-ui-horizontal-separator',
  TwentyUiHorizontalSeparatorElement,
);
customElements.define('twenty-ui-app-tooltip', TwentyUiAppTooltipElement);
customElements.define(
  'twenty-ui-overflowing-text-with-tooltip',
  TwentyUiOverflowingTextWithTooltipElement,
);
customElements.define('twenty-ui-h1-title', TwentyUiH1TitleElement);
customElements.define('twenty-ui-h2-title', TwentyUiH2TitleElement);
customElements.define('twenty-ui-h3-title', TwentyUiH3TitleElement);
customElements.define('twenty-ui-loader', TwentyUiLoaderElement);
customElements.define(
  'twenty-ui-circular-progress-bar',
  TwentyUiCircularProgressBarElement,
);
customElements.define('twenty-ui-progress-bar', TwentyUiProgressBarElement);
customElements.define(
  'twenty-ui-animated-expandable-container',
  TwentyUiAnimatedExpandableContainerElement,
);
customElements.define(
  'twenty-ui-animated-placeholder',
  TwentyUiAnimatedPlaceholderElement,
);
customElements.define('twenty-ui-section', TwentyUiSectionElement);
customElements.define(
  'twenty-ui-advanced-settings-toggle',
  TwentyUiAdvancedSettingsToggleElement,
);
customElements.define(
  'twenty-ui-click-to-action-link',
  TwentyUiClickToActionLinkElement,
);
customElements.define('twenty-ui-contact-link', TwentyUiContactLinkElement);
customElements.define(
  'twenty-ui-github-version-link',
  TwentyUiGithubVersionLinkElement,
);
customElements.define('twenty-ui-raw-link', TwentyUiRawLinkElement);
customElements.define('twenty-ui-rounded-link', TwentyUiRoundedLinkElement);
customElements.define('twenty-ui-social-link', TwentyUiSocialLinkElement);
customElements.define(
  'twenty-ui-undecorated-link',
  TwentyUiUndecoratedLinkElement,
);
customElements.define('twenty-ui-menu-picker', TwentyUiMenuPickerElement);
customElements.define('twenty-ui-menu-item', TwentyUiMenuItemElement);
customElements.define(
  'twenty-ui-menu-item-avatar',
  TwentyUiMenuItemAvatarElement,
);
customElements.define(
  'twenty-ui-menu-item-draggable',
  TwentyUiMenuItemDraggableElement,
);
customElements.define(
  'twenty-ui-menu-item-hot-keys',
  TwentyUiMenuItemHotKeysElement,
);
customElements.define(
  'twenty-ui-menu-item-multi-select',
  TwentyUiMenuItemMultiSelectElement,
);
customElements.define(
  'twenty-ui-menu-item-multi-select-avatar',
  TwentyUiMenuItemMultiSelectAvatarElement,
);
customElements.define(
  'twenty-ui-menu-item-multi-select-tag',
  TwentyUiMenuItemMultiSelectTagElement,
);
customElements.define(
  'twenty-ui-menu-item-navigate',
  TwentyUiMenuItemNavigateElement,
);
customElements.define(
  'twenty-ui-menu-item-select',
  TwentyUiMenuItemSelectElement,
);
customElements.define(
  'twenty-ui-menu-item-select-avatar',
  TwentyUiMenuItemSelectAvatarElement,
);
customElements.define(
  'twenty-ui-menu-item-select-color',
  TwentyUiMenuItemSelectColorElement,
);
customElements.define(
  'twenty-ui-menu-item-select-tag',
  TwentyUiMenuItemSelectTagElement,
);
customElements.define(
  'twenty-ui-menu-item-suggestion',
  TwentyUiMenuItemSuggestionElement,
);
customElements.define(
  'twenty-ui-menu-item-toggle',
  TwentyUiMenuItemToggleElement,
);
customElements.define('twenty-ui-menu-item-icon', TwentyUiMenuItemIconElement);
customElements.define(
  'twenty-ui-menu-item-icon-with-grip-swap',
  TwentyUiMenuItemIconWithGripSwapElement,
);
customElements.define(
  'twenty-ui-menu-item-left-content',
  TwentyUiMenuItemLeftContentElement,
);
customElements.define('twenty-ui-navigation-bar', TwentyUiNavigationBarElement);
customElements.define(
  'twenty-ui-navigation-bar-item',
  TwentyUiNavigationBarItemElement,
);
customElements.define(
  'twenty-ui-notification-counter',
  TwentyUiNotificationCounterElement,
);
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
    'twenty-ui-animated-button': InstanceType<
      typeof TwentyUiAnimatedButtonElement
    >;
    'twenty-ui-animated-light-icon-button': InstanceType<
      typeof TwentyUiAnimatedLightIconButtonElement
    >;
    'twenty-ui-button': InstanceType<typeof TwentyUiButtonElement>;
    'twenty-ui-button-group': InstanceType<typeof TwentyUiButtonGroupElement>;
    'twenty-ui-color-picker-button': InstanceType<
      typeof TwentyUiColorPickerButtonElement
    >;
    'twenty-ui-floating-button': InstanceType<
      typeof TwentyUiFloatingButtonElement
    >;
    'twenty-ui-floating-button-group': InstanceType<
      typeof TwentyUiFloatingButtonGroupElement
    >;
    'twenty-ui-floating-icon-button': InstanceType<
      typeof TwentyUiFloatingIconButtonElement
    >;
    'twenty-ui-floating-icon-button-group': InstanceType<
      typeof TwentyUiFloatingIconButtonGroupElement
    >;
    'twenty-ui-inside-button': InstanceType<typeof TwentyUiInsideButtonElement>;
    'twenty-ui-light-button': InstanceType<typeof TwentyUiLightButtonElement>;
    'twenty-ui-light-icon-button': InstanceType<
      typeof TwentyUiLightIconButtonElement
    >;
    'twenty-ui-light-icon-button-group': InstanceType<
      typeof TwentyUiLightIconButtonGroupElement
    >;
    'twenty-ui-main-button': InstanceType<typeof TwentyUiMainButtonElement>;
    'twenty-ui-rounded-icon-button': InstanceType<
      typeof TwentyUiRoundedIconButtonElement
    >;
    'twenty-ui-tab-content': InstanceType<typeof TwentyUiTabContentElement>;
    'twenty-ui-tab-button': InstanceType<typeof TwentyUiTabButtonElement>;
    'twenty-ui-code-editor': InstanceType<typeof TwentyUiCodeEditorElement>;
    'twenty-ui-core-editor-header': InstanceType<
      typeof TwentyUiCoreEditorHeaderElement
    >;
    'twenty-ui-color-scheme-card': InstanceType<
      typeof TwentyUiColorSchemeCardElement
    >;
    'twenty-ui-color-scheme-picker': InstanceType<
      typeof TwentyUiColorSchemePickerElement
    >;
    'twenty-ui-card-picker': InstanceType<typeof TwentyUiCardPickerElement>;
    'twenty-ui-checkbox': InstanceType<typeof TwentyUiCheckboxElement>;
    'twenty-ui-radio': InstanceType<typeof TwentyUiRadioElement>;
    'twenty-ui-radio-group': InstanceType<typeof TwentyUiRadioGroupElement>;
    'twenty-ui-search-input': InstanceType<typeof TwentyUiSearchInputElement>;
    'twenty-ui-toggle': InstanceType<typeof TwentyUiToggleElement>;
    'twenty-ui-avatar-chip': InstanceType<typeof TwentyUiAvatarChipElement>;
    'twenty-ui-multiple-avatar-chip': InstanceType<
      typeof TwentyUiMultipleAvatarChipElement
    >;
    'twenty-ui-chip': InstanceType<typeof TwentyUiChipElement>;
    'twenty-ui-link-chip': InstanceType<typeof TwentyUiLinkChipElement>;
    'twenty-ui-pill': InstanceType<typeof TwentyUiPillElement>;
    'twenty-ui-tag': InstanceType<typeof TwentyUiTagElement>;
    'twenty-ui-avatar': InstanceType<typeof TwentyUiAvatarElement>;
    'twenty-ui-avatar-group': InstanceType<typeof TwentyUiAvatarGroupElement>;
    'twenty-ui-banner': InstanceType<typeof TwentyUiBannerElement>;
    'twenty-ui-side-panel-information-banner': InstanceType<
      typeof TwentyUiSidePanelInformationBannerElement
    >;
    'twenty-ui-callout': InstanceType<typeof TwentyUiCalloutElement>;
    'twenty-ui-animated-checkmark': InstanceType<
      typeof TwentyUiAnimatedCheckmarkElement
    >;
    'twenty-ui-checkmark': InstanceType<typeof TwentyUiCheckmarkElement>;
    'twenty-ui-color-sample': InstanceType<typeof TwentyUiColorSampleElement>;
    'twenty-ui-command-block': InstanceType<typeof TwentyUiCommandBlockElement>;
    'twenty-ui-icon': InstanceType<typeof TwentyUiIconElement>;
    'twenty-ui-info': InstanceType<typeof TwentyUiInfoElement>;
    'twenty-ui-status': InstanceType<typeof TwentyUiStatusElement>;
    'twenty-ui-horizontal-separator': InstanceType<
      typeof TwentyUiHorizontalSeparatorElement
    >;
    'twenty-ui-app-tooltip': InstanceType<typeof TwentyUiAppTooltipElement>;
    'twenty-ui-overflowing-text-with-tooltip': InstanceType<
      typeof TwentyUiOverflowingTextWithTooltipElement
    >;
    'twenty-ui-h1-title': InstanceType<typeof TwentyUiH1TitleElement>;
    'twenty-ui-h2-title': InstanceType<typeof TwentyUiH2TitleElement>;
    'twenty-ui-h3-title': InstanceType<typeof TwentyUiH3TitleElement>;
    'twenty-ui-loader': InstanceType<typeof TwentyUiLoaderElement>;
    'twenty-ui-circular-progress-bar': InstanceType<
      typeof TwentyUiCircularProgressBarElement
    >;
    'twenty-ui-progress-bar': InstanceType<typeof TwentyUiProgressBarElement>;
    'twenty-ui-animated-expandable-container': InstanceType<
      typeof TwentyUiAnimatedExpandableContainerElement
    >;
    'twenty-ui-animated-placeholder': InstanceType<
      typeof TwentyUiAnimatedPlaceholderElement
    >;
    'twenty-ui-section': InstanceType<typeof TwentyUiSectionElement>;
    'twenty-ui-advanced-settings-toggle': InstanceType<
      typeof TwentyUiAdvancedSettingsToggleElement
    >;
    'twenty-ui-click-to-action-link': InstanceType<
      typeof TwentyUiClickToActionLinkElement
    >;
    'twenty-ui-contact-link': InstanceType<typeof TwentyUiContactLinkElement>;
    'twenty-ui-github-version-link': InstanceType<
      typeof TwentyUiGithubVersionLinkElement
    >;
    'twenty-ui-raw-link': InstanceType<typeof TwentyUiRawLinkElement>;
    'twenty-ui-rounded-link': InstanceType<typeof TwentyUiRoundedLinkElement>;
    'twenty-ui-social-link': InstanceType<typeof TwentyUiSocialLinkElement>;
    'twenty-ui-undecorated-link': InstanceType<
      typeof TwentyUiUndecoratedLinkElement
    >;
    'twenty-ui-menu-picker': InstanceType<typeof TwentyUiMenuPickerElement>;
    'twenty-ui-menu-item': InstanceType<typeof TwentyUiMenuItemElement>;
    'twenty-ui-menu-item-avatar': InstanceType<
      typeof TwentyUiMenuItemAvatarElement
    >;
    'twenty-ui-menu-item-draggable': InstanceType<
      typeof TwentyUiMenuItemDraggableElement
    >;
    'twenty-ui-menu-item-hot-keys': InstanceType<
      typeof TwentyUiMenuItemHotKeysElement
    >;
    'twenty-ui-menu-item-multi-select': InstanceType<
      typeof TwentyUiMenuItemMultiSelectElement
    >;
    'twenty-ui-menu-item-multi-select-avatar': InstanceType<
      typeof TwentyUiMenuItemMultiSelectAvatarElement
    >;
    'twenty-ui-menu-item-multi-select-tag': InstanceType<
      typeof TwentyUiMenuItemMultiSelectTagElement
    >;
    'twenty-ui-menu-item-navigate': InstanceType<
      typeof TwentyUiMenuItemNavigateElement
    >;
    'twenty-ui-menu-item-select': InstanceType<
      typeof TwentyUiMenuItemSelectElement
    >;
    'twenty-ui-menu-item-select-avatar': InstanceType<
      typeof TwentyUiMenuItemSelectAvatarElement
    >;
    'twenty-ui-menu-item-select-color': InstanceType<
      typeof TwentyUiMenuItemSelectColorElement
    >;
    'twenty-ui-menu-item-select-tag': InstanceType<
      typeof TwentyUiMenuItemSelectTagElement
    >;
    'twenty-ui-menu-item-suggestion': InstanceType<
      typeof TwentyUiMenuItemSuggestionElement
    >;
    'twenty-ui-menu-item-toggle': InstanceType<
      typeof TwentyUiMenuItemToggleElement
    >;
    'twenty-ui-menu-item-icon': InstanceType<
      typeof TwentyUiMenuItemIconElement
    >;
    'twenty-ui-menu-item-icon-with-grip-swap': InstanceType<
      typeof TwentyUiMenuItemIconWithGripSwapElement
    >;
    'twenty-ui-menu-item-left-content': InstanceType<
      typeof TwentyUiMenuItemLeftContentElement
    >;
    'twenty-ui-navigation-bar': InstanceType<
      typeof TwentyUiNavigationBarElement
    >;
    'twenty-ui-navigation-bar-item': InstanceType<
      typeof TwentyUiNavigationBarItemElement
    >;
    'twenty-ui-notification-counter': InstanceType<
      typeof TwentyUiNotificationCounterElement
    >;
    'remote-root': InstanceType<typeof RemoteRootElement>;
    'remote-fragment': InstanceType<typeof RemoteFragmentElement>;
  }
}
