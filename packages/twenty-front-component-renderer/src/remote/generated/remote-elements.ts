import {
  createRemoteElement,
  RemoteRootElement,
  RemoteFragmentElement,
  type RemoteEvent,
} from '@remote-dom/core/elements';
import { type SerializedEventData } from '@/constants/SerializedEventData';

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

export type HtmlIframeProperties = HtmlCommonProperties & {
  src?: string;
  name?: string;
  width?: string;
  height?: string;
  allow?: string;
  sandbox?: string;
  allowFullScreen?: boolean;
  loading?: string;
  referrerPolicy?: string;
  srcDoc?: string;
};

export const HtmlIframeElement = createRemoteElement<
  HtmlIframeProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    src: { type: String },
    name: { type: String },
    width: { type: String },
    height: { type: String },
    allow: { type: String },
    sandbox: { type: String },
    allowFullScreen: { type: Boolean },
    loading: { type: String },
    referrerPolicy: { type: String },
    srcDoc: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlVideoProperties = HtmlCommonProperties & {
  src?: string;
  poster?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: string;
  width?: string;
  height?: string;
  crossOrigin?: string;
  playsInline?: boolean;
  disablePictureInPicture?: boolean;
  disableRemotePlayback?: boolean;
};

export const HtmlVideoElement = createRemoteElement<
  HtmlVideoProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents & {
    timeupdate(event: RemoteEvent<SerializedEventData>): void;
    play(event: RemoteEvent<SerializedEventData>): void;
    pause(event: RemoteEvent<SerializedEventData>): void;
    ended(event: RemoteEvent<SerializedEventData>): void;
    loadedmetadata(event: RemoteEvent<SerializedEventData>): void;
    loadeddata(event: RemoteEvent<SerializedEventData>): void;
    volumechange(event: RemoteEvent<SerializedEventData>): void;
    seeking(event: RemoteEvent<SerializedEventData>): void;
    seeked(event: RemoteEvent<SerializedEventData>): void;
    error(event: RemoteEvent<SerializedEventData>): void;
    canplay(event: RemoteEvent<SerializedEventData>): void;
    canplaythrough(event: RemoteEvent<SerializedEventData>): void;
    waiting(event: RemoteEvent<SerializedEventData>): void;
    progress(event: RemoteEvent<SerializedEventData>): void;
    durationchange(event: RemoteEvent<SerializedEventData>): void;
    ratechange(event: RemoteEvent<SerializedEventData>): void;
    stalled(event: RemoteEvent<SerializedEventData>): void;
    suspend(event: RemoteEvent<SerializedEventData>): void;
    emptied(event: RemoteEvent<SerializedEventData>): void;
  }
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    src: { type: String },
    poster: { type: String },
    controls: { type: Boolean },
    autoPlay: { type: Boolean },
    loop: { type: Boolean },
    muted: { type: Boolean },
    preload: { type: String },
    width: { type: String },
    height: { type: String },
    crossOrigin: { type: String },
    playsInline: { type: Boolean },
    disablePictureInPicture: { type: Boolean },
    disableRemotePlayback: { type: Boolean },
  },
  events: [
    ...HTML_COMMON_EVENTS_ARRAY,
    'timeupdate',
    'play',
    'pause',
    'ended',
    'loadedmetadata',
    'loadeddata',
    'volumechange',
    'seeking',
    'seeked',
    'error',
    'canplay',
    'canplaythrough',
    'waiting',
    'progress',
    'durationchange',
    'ratechange',
    'stalled',
    'suspend',
    'emptied',
  ],
});

export type HtmlAudioProperties = HtmlCommonProperties & {
  src?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: string;
  crossOrigin?: string;
};

export const HtmlAudioElement = createRemoteElement<
  HtmlAudioProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents & {
    timeupdate(event: RemoteEvent<SerializedEventData>): void;
    play(event: RemoteEvent<SerializedEventData>): void;
    pause(event: RemoteEvent<SerializedEventData>): void;
    ended(event: RemoteEvent<SerializedEventData>): void;
    loadedmetadata(event: RemoteEvent<SerializedEventData>): void;
    loadeddata(event: RemoteEvent<SerializedEventData>): void;
    volumechange(event: RemoteEvent<SerializedEventData>): void;
    seeking(event: RemoteEvent<SerializedEventData>): void;
    seeked(event: RemoteEvent<SerializedEventData>): void;
    error(event: RemoteEvent<SerializedEventData>): void;
    canplay(event: RemoteEvent<SerializedEventData>): void;
    canplaythrough(event: RemoteEvent<SerializedEventData>): void;
    waiting(event: RemoteEvent<SerializedEventData>): void;
    progress(event: RemoteEvent<SerializedEventData>): void;
    durationchange(event: RemoteEvent<SerializedEventData>): void;
    ratechange(event: RemoteEvent<SerializedEventData>): void;
    stalled(event: RemoteEvent<SerializedEventData>): void;
    suspend(event: RemoteEvent<SerializedEventData>): void;
    emptied(event: RemoteEvent<SerializedEventData>): void;
  }
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    src: { type: String },
    controls: { type: Boolean },
    autoPlay: { type: Boolean },
    loop: { type: Boolean },
    muted: { type: Boolean },
    preload: { type: String },
    crossOrigin: { type: String },
  },
  events: [
    ...HTML_COMMON_EVENTS_ARRAY,
    'timeupdate',
    'play',
    'pause',
    'ended',
    'loadedmetadata',
    'loadeddata',
    'volumechange',
    'seeking',
    'seeked',
    'error',
    'canplay',
    'canplaythrough',
    'waiting',
    'progress',
    'durationchange',
    'ratechange',
    'stalled',
    'suspend',
    'emptied',
  ],
});

export type HtmlSourceProperties = HtmlCommonProperties & {
  src?: string;
  type?: string;
  media?: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
};

export const HtmlSourceElement = createRemoteElement<
  HtmlSourceProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    src: { type: String },
    type: { type: String },
    media: { type: String },
    srcSet: { type: String },
    sizes: { type: String },
    width: { type: Number },
    height: { type: Number },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlBElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlIElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlUElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlSElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlMarkElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlSubElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlSupElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlAbbrElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlCiteElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlKbdElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlSampElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlVarElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlDfnElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlBdiElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlBdoProperties = HtmlCommonProperties & {
  dir?: string;
};

export const HtmlBdoElement = createRemoteElement<
  HtmlBdoProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    dir: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlDataProperties = HtmlCommonProperties & {
  value?: string;
};

export const HtmlDataElement = createRemoteElement<
  HtmlDataProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    value: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlDelProperties = HtmlCommonProperties & {
  cite?: string;
  dateTime?: string;
};

export const HtmlDelElement = createRemoteElement<
  HtmlDelProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    cite: { type: String },
    dateTime: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlInsProperties = HtmlCommonProperties & {
  cite?: string;
  dateTime?: string;
};

export const HtmlInsElement = createRemoteElement<
  HtmlInsProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    cite: { type: String },
    dateTime: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlQProperties = HtmlCommonProperties & {
  cite?: string;
};

export const HtmlQElement = createRemoteElement<
  HtmlQProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    cite: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlTimeProperties = HtmlCommonProperties & {
  dateTime?: string;
};

export const HtmlTimeElement = createRemoteElement<
  HtmlTimeProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    dateTime: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlRubyElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlRtElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlRpElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlDlElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlDtElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlDdElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlFigureElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlFigcaptionElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlDetailsProperties = HtmlCommonProperties & {
  open?: boolean;
};

export const HtmlDetailsElement = createRemoteElement<
  HtmlDetailsProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    open: { type: Boolean },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlSummaryElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlAddressElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlDialogProperties = HtmlCommonProperties & {
  open?: boolean;
};

export const HtmlDialogElement = createRemoteElement<
  HtmlDialogProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    open: { type: Boolean },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlHgroupElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlSearchElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlCaptionElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlColgroupProperties = HtmlCommonProperties & {
  span?: number;
};

export const HtmlColgroupElement = createRemoteElement<
  HtmlColgroupProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    span: { type: Number },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlColProperties = HtmlCommonProperties & {
  span?: number;
};

export const HtmlColElement = createRemoteElement<
  HtmlColProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    span: { type: Number },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlFieldsetProperties = HtmlCommonProperties & {
  disabled?: boolean;
  name?: string;
};

export const HtmlFieldsetElement = createRemoteElement<
  HtmlFieldsetProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    disabled: { type: Boolean },
    name: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlLegendElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlOutputProperties = HtmlCommonProperties & {
  name?: string;
  htmlFor?: string;
};

export const HtmlOutputElement = createRemoteElement<
  HtmlOutputProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    name: { type: String },
    htmlFor: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlProgressProperties = HtmlCommonProperties & {
  value?: number;
  max?: number;
};

export const HtmlProgressElement = createRemoteElement<
  HtmlProgressProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    value: { type: Number },
    max: { type: Number },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlMeterProperties = HtmlCommonProperties & {
  value?: number;
  min?: number;
  max?: number;
  low?: number;
  high?: number;
  optimum?: number;
};

export const HtmlMeterElement = createRemoteElement<
  HtmlMeterProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    value: { type: Number },
    min: { type: Number },
    max: { type: Number },
    low: { type: Number },
    high: { type: Number },
    optimum: { type: Number },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlOptgroupProperties = HtmlCommonProperties & {
  label?: string;
  disabled?: boolean;
};

export const HtmlOptgroupElement = createRemoteElement<
  HtmlOptgroupProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    label: { type: String },
    disabled: { type: Boolean },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlDatalistElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlPictureElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlTrackProperties = HtmlCommonProperties & {
  src?: string;
  kind?: string;
  srclang?: string;
  label?: string;
  default?: boolean;
};

export const HtmlTrackElement = createRemoteElement<
  HtmlTrackProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    src: { type: String },
    kind: { type: String },
    srclang: { type: String },
    label: { type: String },
    default: { type: Boolean },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlWbrElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlMenuElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlSvgProperties = HtmlCommonProperties & {
  fill?: string;
  fillOpacity?: string;
  fillRule?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeOpacity?: string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeDasharray?: string;
  strokeDashoffset?: string;
  strokeMiterlimit?: string;
  opacity?: string;
  transform?: string;
  clipPath?: string;
  clipRule?: string;
  mask?: string;
  filter?: string;
  pointerEvents?: string;
  viewBox?: string;
  xmlns?: string;
  width?: string;
  height?: string;
  preserveAspectRatio?: string;
};

export const HtmlSvgElement = createRemoteElement<
  HtmlSvgProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    fill: { type: String },
    fillOpacity: { type: String },
    fillRule: { type: String },
    stroke: { type: String },
    strokeWidth: { type: String },
    strokeOpacity: { type: String },
    strokeLinecap: { type: String },
    strokeLinejoin: { type: String },
    strokeDasharray: { type: String },
    strokeDashoffset: { type: String },
    strokeMiterlimit: { type: String },
    opacity: { type: String },
    transform: { type: String },
    clipPath: { type: String },
    clipRule: { type: String },
    mask: { type: String },
    filter: { type: String },
    pointerEvents: { type: String },
    viewBox: { type: String },
    xmlns: { type: String },
    width: { type: String },
    height: { type: String },
    preserveAspectRatio: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlGProperties = HtmlCommonProperties & {
  fill?: string;
  fillOpacity?: string;
  fillRule?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeOpacity?: string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeDasharray?: string;
  strokeDashoffset?: string;
  strokeMiterlimit?: string;
  opacity?: string;
  transform?: string;
  clipPath?: string;
  clipRule?: string;
  mask?: string;
  filter?: string;
  pointerEvents?: string;
};

export const HtmlGElement = createRemoteElement<
  HtmlGProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    fill: { type: String },
    fillOpacity: { type: String },
    fillRule: { type: String },
    stroke: { type: String },
    strokeWidth: { type: String },
    strokeOpacity: { type: String },
    strokeLinecap: { type: String },
    strokeLinejoin: { type: String },
    strokeDasharray: { type: String },
    strokeDashoffset: { type: String },
    strokeMiterlimit: { type: String },
    opacity: { type: String },
    transform: { type: String },
    clipPath: { type: String },
    clipRule: { type: String },
    mask: { type: String },
    filter: { type: String },
    pointerEvents: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlDefsElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlSymbolProperties = HtmlCommonProperties & {
  viewBox?: string;
};

export const HtmlSymbolElement = createRemoteElement<
  HtmlSymbolProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    viewBox: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlUseProperties = HtmlCommonProperties & {
  href?: string;
  x?: string;
  y?: string;
  width?: string;
  height?: string;
};

export const HtmlUseElement = createRemoteElement<
  HtmlUseProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    href: { type: String },
    x: { type: String },
    y: { type: String },
    width: { type: String },
    height: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlClipPathProperties = HtmlCommonProperties & {
  clipPathUnits?: string;
};

export const HtmlClipPathElement = createRemoteElement<
  HtmlClipPathProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    clipPathUnits: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlMaskProperties = HtmlCommonProperties & {
  maskUnits?: string;
};

export const HtmlMaskElement = createRemoteElement<
  HtmlMaskProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    maskUnits: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlCircleProperties = HtmlCommonProperties & {
  fill?: string;
  fillOpacity?: string;
  fillRule?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeOpacity?: string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeDasharray?: string;
  strokeDashoffset?: string;
  strokeMiterlimit?: string;
  opacity?: string;
  transform?: string;
  clipPath?: string;
  clipRule?: string;
  mask?: string;
  filter?: string;
  pointerEvents?: string;
  cx?: string;
  cy?: string;
  r?: string;
};

export const HtmlCircleElement = createRemoteElement<
  HtmlCircleProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    fill: { type: String },
    fillOpacity: { type: String },
    fillRule: { type: String },
    stroke: { type: String },
    strokeWidth: { type: String },
    strokeOpacity: { type: String },
    strokeLinecap: { type: String },
    strokeLinejoin: { type: String },
    strokeDasharray: { type: String },
    strokeDashoffset: { type: String },
    strokeMiterlimit: { type: String },
    opacity: { type: String },
    transform: { type: String },
    clipPath: { type: String },
    clipRule: { type: String },
    mask: { type: String },
    filter: { type: String },
    pointerEvents: { type: String },
    cx: { type: String },
    cy: { type: String },
    r: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlEllipseProperties = HtmlCommonProperties & {
  fill?: string;
  fillOpacity?: string;
  fillRule?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeOpacity?: string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeDasharray?: string;
  strokeDashoffset?: string;
  strokeMiterlimit?: string;
  opacity?: string;
  transform?: string;
  clipPath?: string;
  clipRule?: string;
  mask?: string;
  filter?: string;
  pointerEvents?: string;
  cx?: string;
  cy?: string;
  rx?: string;
  ry?: string;
};

export const HtmlEllipseElement = createRemoteElement<
  HtmlEllipseProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    fill: { type: String },
    fillOpacity: { type: String },
    fillRule: { type: String },
    stroke: { type: String },
    strokeWidth: { type: String },
    strokeOpacity: { type: String },
    strokeLinecap: { type: String },
    strokeLinejoin: { type: String },
    strokeDasharray: { type: String },
    strokeDashoffset: { type: String },
    strokeMiterlimit: { type: String },
    opacity: { type: String },
    transform: { type: String },
    clipPath: { type: String },
    clipRule: { type: String },
    mask: { type: String },
    filter: { type: String },
    pointerEvents: { type: String },
    cx: { type: String },
    cy: { type: String },
    rx: { type: String },
    ry: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlRectProperties = HtmlCommonProperties & {
  fill?: string;
  fillOpacity?: string;
  fillRule?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeOpacity?: string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeDasharray?: string;
  strokeDashoffset?: string;
  strokeMiterlimit?: string;
  opacity?: string;
  transform?: string;
  clipPath?: string;
  clipRule?: string;
  mask?: string;
  filter?: string;
  pointerEvents?: string;
  x?: string;
  y?: string;
  width?: string;
  height?: string;
  rx?: string;
  ry?: string;
};

export const HtmlRectElement = createRemoteElement<
  HtmlRectProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    fill: { type: String },
    fillOpacity: { type: String },
    fillRule: { type: String },
    stroke: { type: String },
    strokeWidth: { type: String },
    strokeOpacity: { type: String },
    strokeLinecap: { type: String },
    strokeLinejoin: { type: String },
    strokeDasharray: { type: String },
    strokeDashoffset: { type: String },
    strokeMiterlimit: { type: String },
    opacity: { type: String },
    transform: { type: String },
    clipPath: { type: String },
    clipRule: { type: String },
    mask: { type: String },
    filter: { type: String },
    pointerEvents: { type: String },
    x: { type: String },
    y: { type: String },
    width: { type: String },
    height: { type: String },
    rx: { type: String },
    ry: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlLineProperties = HtmlCommonProperties & {
  fill?: string;
  fillOpacity?: string;
  fillRule?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeOpacity?: string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeDasharray?: string;
  strokeDashoffset?: string;
  strokeMiterlimit?: string;
  opacity?: string;
  transform?: string;
  clipPath?: string;
  clipRule?: string;
  mask?: string;
  filter?: string;
  pointerEvents?: string;
  x1?: string;
  y1?: string;
  x2?: string;
  y2?: string;
};

export const HtmlLineElement = createRemoteElement<
  HtmlLineProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    fill: { type: String },
    fillOpacity: { type: String },
    fillRule: { type: String },
    stroke: { type: String },
    strokeWidth: { type: String },
    strokeOpacity: { type: String },
    strokeLinecap: { type: String },
    strokeLinejoin: { type: String },
    strokeDasharray: { type: String },
    strokeDashoffset: { type: String },
    strokeMiterlimit: { type: String },
    opacity: { type: String },
    transform: { type: String },
    clipPath: { type: String },
    clipRule: { type: String },
    mask: { type: String },
    filter: { type: String },
    pointerEvents: { type: String },
    x1: { type: String },
    y1: { type: String },
    x2: { type: String },
    y2: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlPathProperties = HtmlCommonProperties & {
  fill?: string;
  fillOpacity?: string;
  fillRule?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeOpacity?: string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeDasharray?: string;
  strokeDashoffset?: string;
  strokeMiterlimit?: string;
  opacity?: string;
  transform?: string;
  clipPath?: string;
  clipRule?: string;
  mask?: string;
  filter?: string;
  pointerEvents?: string;
  d?: string;
};

export const HtmlPathElement = createRemoteElement<
  HtmlPathProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    fill: { type: String },
    fillOpacity: { type: String },
    fillRule: { type: String },
    stroke: { type: String },
    strokeWidth: { type: String },
    strokeOpacity: { type: String },
    strokeLinecap: { type: String },
    strokeLinejoin: { type: String },
    strokeDasharray: { type: String },
    strokeDashoffset: { type: String },
    strokeMiterlimit: { type: String },
    opacity: { type: String },
    transform: { type: String },
    clipPath: { type: String },
    clipRule: { type: String },
    mask: { type: String },
    filter: { type: String },
    pointerEvents: { type: String },
    d: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlPolygonProperties = HtmlCommonProperties & {
  fill?: string;
  fillOpacity?: string;
  fillRule?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeOpacity?: string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeDasharray?: string;
  strokeDashoffset?: string;
  strokeMiterlimit?: string;
  opacity?: string;
  transform?: string;
  clipPath?: string;
  clipRule?: string;
  mask?: string;
  filter?: string;
  pointerEvents?: string;
  points?: string;
};

export const HtmlPolygonElement = createRemoteElement<
  HtmlPolygonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    fill: { type: String },
    fillOpacity: { type: String },
    fillRule: { type: String },
    stroke: { type: String },
    strokeWidth: { type: String },
    strokeOpacity: { type: String },
    strokeLinecap: { type: String },
    strokeLinejoin: { type: String },
    strokeDasharray: { type: String },
    strokeDashoffset: { type: String },
    strokeMiterlimit: { type: String },
    opacity: { type: String },
    transform: { type: String },
    clipPath: { type: String },
    clipRule: { type: String },
    mask: { type: String },
    filter: { type: String },
    pointerEvents: { type: String },
    points: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlPolylineProperties = HtmlCommonProperties & {
  fill?: string;
  fillOpacity?: string;
  fillRule?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeOpacity?: string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeDasharray?: string;
  strokeDashoffset?: string;
  strokeMiterlimit?: string;
  opacity?: string;
  transform?: string;
  clipPath?: string;
  clipRule?: string;
  mask?: string;
  filter?: string;
  pointerEvents?: string;
  points?: string;
};

export const HtmlPolylineElement = createRemoteElement<
  HtmlPolylineProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    fill: { type: String },
    fillOpacity: { type: String },
    fillRule: { type: String },
    stroke: { type: String },
    strokeWidth: { type: String },
    strokeOpacity: { type: String },
    strokeLinecap: { type: String },
    strokeLinejoin: { type: String },
    strokeDasharray: { type: String },
    strokeDashoffset: { type: String },
    strokeMiterlimit: { type: String },
    opacity: { type: String },
    transform: { type: String },
    clipPath: { type: String },
    clipRule: { type: String },
    mask: { type: String },
    filter: { type: String },
    pointerEvents: { type: String },
    points: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlTextProperties = HtmlCommonProperties & {
  fill?: string;
  fillOpacity?: string;
  fillRule?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeOpacity?: string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeDasharray?: string;
  strokeDashoffset?: string;
  strokeMiterlimit?: string;
  opacity?: string;
  transform?: string;
  clipPath?: string;
  clipRule?: string;
  mask?: string;
  filter?: string;
  pointerEvents?: string;
  x?: string;
  y?: string;
  dx?: string;
  dy?: string;
  textAnchor?: string;
  dominantBaseline?: string;
};

export const HtmlTextElement = createRemoteElement<
  HtmlTextProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    fill: { type: String },
    fillOpacity: { type: String },
    fillRule: { type: String },
    stroke: { type: String },
    strokeWidth: { type: String },
    strokeOpacity: { type: String },
    strokeLinecap: { type: String },
    strokeLinejoin: { type: String },
    strokeDasharray: { type: String },
    strokeDashoffset: { type: String },
    strokeMiterlimit: { type: String },
    opacity: { type: String },
    transform: { type: String },
    clipPath: { type: String },
    clipRule: { type: String },
    mask: { type: String },
    filter: { type: String },
    pointerEvents: { type: String },
    x: { type: String },
    y: { type: String },
    dx: { type: String },
    dy: { type: String },
    textAnchor: { type: String },
    dominantBaseline: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlTspanProperties = HtmlCommonProperties & {
  fill?: string;
  fillOpacity?: string;
  fillRule?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeOpacity?: string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeDasharray?: string;
  strokeDashoffset?: string;
  strokeMiterlimit?: string;
  opacity?: string;
  transform?: string;
  clipPath?: string;
  clipRule?: string;
  mask?: string;
  filter?: string;
  pointerEvents?: string;
  x?: string;
  y?: string;
  dx?: string;
  dy?: string;
};

export const HtmlTspanElement = createRemoteElement<
  HtmlTspanProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    fill: { type: String },
    fillOpacity: { type: String },
    fillRule: { type: String },
    stroke: { type: String },
    strokeWidth: { type: String },
    strokeOpacity: { type: String },
    strokeLinecap: { type: String },
    strokeLinejoin: { type: String },
    strokeDasharray: { type: String },
    strokeDashoffset: { type: String },
    strokeMiterlimit: { type: String },
    opacity: { type: String },
    transform: { type: String },
    clipPath: { type: String },
    clipRule: { type: String },
    mask: { type: String },
    filter: { type: String },
    pointerEvents: { type: String },
    x: { type: String },
    y: { type: String },
    dx: { type: String },
    dy: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlLinearGradientProperties = HtmlCommonProperties & {
  x1?: string;
  y1?: string;
  x2?: string;
  y2?: string;
  gradientUnits?: string;
  gradientTransform?: string;
};

export const HtmlLinearGradientElement = createRemoteElement<
  HtmlLinearGradientProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    x1: { type: String },
    y1: { type: String },
    x2: { type: String },
    y2: { type: String },
    gradientUnits: { type: String },
    gradientTransform: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlRadialGradientProperties = HtmlCommonProperties & {
  cx?: string;
  cy?: string;
  r?: string;
  fx?: string;
  fy?: string;
  gradientUnits?: string;
  gradientTransform?: string;
};

export const HtmlRadialGradientElement = createRemoteElement<
  HtmlRadialGradientProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    cx: { type: String },
    cy: { type: String },
    r: { type: String },
    fx: { type: String },
    fy: { type: String },
    gradientUnits: { type: String },
    gradientTransform: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlStopProperties = HtmlCommonProperties & {
  offset?: string;
  stopColor?: string;
  stopOpacity?: string;
};

export const HtmlStopElement = createRemoteElement<
  HtmlStopProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    offset: { type: String },
    stopColor: { type: String },
    stopOpacity: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlPatternProperties = HtmlCommonProperties & {
  x?: string;
  y?: string;
  width?: string;
  height?: string;
  patternUnits?: string;
  patternTransform?: string;
};

export const HtmlPatternElement = createRemoteElement<
  HtmlPatternProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    x: { type: String },
    y: { type: String },
    width: { type: String },
    height: { type: String },
    patternUnits: { type: String },
    patternTransform: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlImageProperties = HtmlCommonProperties & {
  href?: string;
  x?: string;
  y?: string;
  width?: string;
  height?: string;
  preserveAspectRatio?: string;
};

export const HtmlImageElement = createRemoteElement<
  HtmlImageProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    href: { type: String },
    x: { type: String },
    y: { type: String },
    width: { type: String },
    height: { type: String },
    preserveAspectRatio: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlForeignObjectProperties = HtmlCommonProperties & {
  x?: string;
  y?: string;
  width?: string;
  height?: string;
};

export const HtmlForeignObjectElement = createRemoteElement<
  HtmlForeignObjectProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    x: { type: String },
    y: { type: String },
    width: { type: String },
    height: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type HtmlMarkerProperties = HtmlCommonProperties & {
  markerWidth?: string;
  markerHeight?: string;
  refX?: string;
  refY?: string;
  orient?: string;
  markerUnits?: string;
};

export const HtmlMarkerElement = createRemoteElement<
  HtmlMarkerProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: {
    ...HTML_COMMON_PROPERTIES_CONFIG,
    markerWidth: { type: String },
    markerHeight: { type: String },
    refX: { type: String },
    refY: { type: String },
    orient: { type: String },
    markerUnits: { type: String },
  },
  events: [...HTML_COMMON_EVENTS_ARRAY],
});
export const HtmlTitleElement = createRemoteElement<
  HtmlCommonProperties,
  Record<string, never>,
  Record<string, never>,
  HtmlCommonEvents
>({
  properties: HTML_COMMON_PROPERTIES_CONFIG,
  events: [...HTML_COMMON_EVENTS_ARRAY],
});

export type RemoteStyleProperties = {
  cssText?: string;
  styleKey?: string;
};

export const RemoteStyleElement = createRemoteElement<
  RemoteStyleProperties,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>({
  properties: {
    cssText: { type: String },
    styleKey: { type: String },
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
customElements.define('html-iframe', HtmlIframeElement);
customElements.define('html-video', HtmlVideoElement);
customElements.define('html-audio', HtmlAudioElement);
customElements.define('html-source', HtmlSourceElement);
customElements.define('html-b', HtmlBElement);
customElements.define('html-i', HtmlIElement);
customElements.define('html-u', HtmlUElement);
customElements.define('html-s', HtmlSElement);
customElements.define('html-mark', HtmlMarkElement);
customElements.define('html-sub', HtmlSubElement);
customElements.define('html-sup', HtmlSupElement);
customElements.define('html-abbr', HtmlAbbrElement);
customElements.define('html-cite', HtmlCiteElement);
customElements.define('html-kbd', HtmlKbdElement);
customElements.define('html-samp', HtmlSampElement);
customElements.define('html-var', HtmlVarElement);
customElements.define('html-dfn', HtmlDfnElement);
customElements.define('html-bdi', HtmlBdiElement);
customElements.define('html-bdo', HtmlBdoElement);
customElements.define('html-data', HtmlDataElement);
customElements.define('html-del', HtmlDelElement);
customElements.define('html-ins', HtmlInsElement);
customElements.define('html-q', HtmlQElement);
customElements.define('html-time', HtmlTimeElement);
customElements.define('html-ruby', HtmlRubyElement);
customElements.define('html-rt', HtmlRtElement);
customElements.define('html-rp', HtmlRpElement);
customElements.define('html-dl', HtmlDlElement);
customElements.define('html-dt', HtmlDtElement);
customElements.define('html-dd', HtmlDdElement);
customElements.define('html-figure', HtmlFigureElement);
customElements.define('html-figcaption', HtmlFigcaptionElement);
customElements.define('html-details', HtmlDetailsElement);
customElements.define('html-summary', HtmlSummaryElement);
customElements.define('html-address', HtmlAddressElement);
customElements.define('html-dialog', HtmlDialogElement);
customElements.define('html-hgroup', HtmlHgroupElement);
customElements.define('html-search', HtmlSearchElement);
customElements.define('html-caption', HtmlCaptionElement);
customElements.define('html-colgroup', HtmlColgroupElement);
customElements.define('html-col', HtmlColElement);
customElements.define('html-fieldset', HtmlFieldsetElement);
customElements.define('html-legend', HtmlLegendElement);
customElements.define('html-output', HtmlOutputElement);
customElements.define('html-progress', HtmlProgressElement);
customElements.define('html-meter', HtmlMeterElement);
customElements.define('html-optgroup', HtmlOptgroupElement);
customElements.define('html-datalist', HtmlDatalistElement);
customElements.define('html-picture', HtmlPictureElement);
customElements.define('html-track', HtmlTrackElement);
customElements.define('html-wbr', HtmlWbrElement);
customElements.define('html-menu', HtmlMenuElement);
customElements.define('html-svg', HtmlSvgElement);
customElements.define('html-g', HtmlGElement);
customElements.define('html-defs', HtmlDefsElement);
customElements.define('html-symbol', HtmlSymbolElement);
customElements.define('html-use', HtmlUseElement);
customElements.define('html-clippath', HtmlClipPathElement);
customElements.define('html-mask', HtmlMaskElement);
customElements.define('html-circle', HtmlCircleElement);
customElements.define('html-ellipse', HtmlEllipseElement);
customElements.define('html-rect', HtmlRectElement);
customElements.define('html-line', HtmlLineElement);
customElements.define('html-path', HtmlPathElement);
customElements.define('html-polygon', HtmlPolygonElement);
customElements.define('html-polyline', HtmlPolylineElement);
customElements.define('html-text', HtmlTextElement);
customElements.define('html-tspan', HtmlTspanElement);
customElements.define('html-lineargradient', HtmlLinearGradientElement);
customElements.define('html-radialgradient', HtmlRadialGradientElement);
customElements.define('html-stop', HtmlStopElement);
customElements.define('html-pattern', HtmlPatternElement);
customElements.define('html-image', HtmlImageElement);
customElements.define('html-foreignobject', HtmlForeignObjectElement);
customElements.define('html-marker', HtmlMarkerElement);
customElements.define('html-title', HtmlTitleElement);
customElements.define('remote-style', RemoteStyleElement);
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
    'html-iframe': InstanceType<typeof HtmlIframeElement>;
    'html-video': InstanceType<typeof HtmlVideoElement>;
    'html-audio': InstanceType<typeof HtmlAudioElement>;
    'html-source': InstanceType<typeof HtmlSourceElement>;
    'html-b': InstanceType<typeof HtmlBElement>;
    'html-i': InstanceType<typeof HtmlIElement>;
    'html-u': InstanceType<typeof HtmlUElement>;
    'html-s': InstanceType<typeof HtmlSElement>;
    'html-mark': InstanceType<typeof HtmlMarkElement>;
    'html-sub': InstanceType<typeof HtmlSubElement>;
    'html-sup': InstanceType<typeof HtmlSupElement>;
    'html-abbr': InstanceType<typeof HtmlAbbrElement>;
    'html-cite': InstanceType<typeof HtmlCiteElement>;
    'html-kbd': InstanceType<typeof HtmlKbdElement>;
    'html-samp': InstanceType<typeof HtmlSampElement>;
    'html-var': InstanceType<typeof HtmlVarElement>;
    'html-dfn': InstanceType<typeof HtmlDfnElement>;
    'html-bdi': InstanceType<typeof HtmlBdiElement>;
    'html-bdo': InstanceType<typeof HtmlBdoElement>;
    'html-data': InstanceType<typeof HtmlDataElement>;
    'html-del': InstanceType<typeof HtmlDelElement>;
    'html-ins': InstanceType<typeof HtmlInsElement>;
    'html-q': InstanceType<typeof HtmlQElement>;
    'html-time': InstanceType<typeof HtmlTimeElement>;
    'html-ruby': InstanceType<typeof HtmlRubyElement>;
    'html-rt': InstanceType<typeof HtmlRtElement>;
    'html-rp': InstanceType<typeof HtmlRpElement>;
    'html-dl': InstanceType<typeof HtmlDlElement>;
    'html-dt': InstanceType<typeof HtmlDtElement>;
    'html-dd': InstanceType<typeof HtmlDdElement>;
    'html-figure': InstanceType<typeof HtmlFigureElement>;
    'html-figcaption': InstanceType<typeof HtmlFigcaptionElement>;
    'html-details': InstanceType<typeof HtmlDetailsElement>;
    'html-summary': InstanceType<typeof HtmlSummaryElement>;
    'html-address': InstanceType<typeof HtmlAddressElement>;
    'html-dialog': InstanceType<typeof HtmlDialogElement>;
    'html-hgroup': InstanceType<typeof HtmlHgroupElement>;
    'html-search': InstanceType<typeof HtmlSearchElement>;
    'html-caption': InstanceType<typeof HtmlCaptionElement>;
    'html-colgroup': InstanceType<typeof HtmlColgroupElement>;
    'html-col': InstanceType<typeof HtmlColElement>;
    'html-fieldset': InstanceType<typeof HtmlFieldsetElement>;
    'html-legend': InstanceType<typeof HtmlLegendElement>;
    'html-output': InstanceType<typeof HtmlOutputElement>;
    'html-progress': InstanceType<typeof HtmlProgressElement>;
    'html-meter': InstanceType<typeof HtmlMeterElement>;
    'html-optgroup': InstanceType<typeof HtmlOptgroupElement>;
    'html-datalist': InstanceType<typeof HtmlDatalistElement>;
    'html-picture': InstanceType<typeof HtmlPictureElement>;
    'html-track': InstanceType<typeof HtmlTrackElement>;
    'html-wbr': InstanceType<typeof HtmlWbrElement>;
    'html-menu': InstanceType<typeof HtmlMenuElement>;
    'html-svg': InstanceType<typeof HtmlSvgElement>;
    'html-g': InstanceType<typeof HtmlGElement>;
    'html-defs': InstanceType<typeof HtmlDefsElement>;
    'html-symbol': InstanceType<typeof HtmlSymbolElement>;
    'html-use': InstanceType<typeof HtmlUseElement>;
    'html-clippath': InstanceType<typeof HtmlClipPathElement>;
    'html-mask': InstanceType<typeof HtmlMaskElement>;
    'html-circle': InstanceType<typeof HtmlCircleElement>;
    'html-ellipse': InstanceType<typeof HtmlEllipseElement>;
    'html-rect': InstanceType<typeof HtmlRectElement>;
    'html-line': InstanceType<typeof HtmlLineElement>;
    'html-path': InstanceType<typeof HtmlPathElement>;
    'html-polygon': InstanceType<typeof HtmlPolygonElement>;
    'html-polyline': InstanceType<typeof HtmlPolylineElement>;
    'html-text': InstanceType<typeof HtmlTextElement>;
    'html-tspan': InstanceType<typeof HtmlTspanElement>;
    'html-lineargradient': InstanceType<typeof HtmlLinearGradientElement>;
    'html-radialgradient': InstanceType<typeof HtmlRadialGradientElement>;
    'html-stop': InstanceType<typeof HtmlStopElement>;
    'html-pattern': InstanceType<typeof HtmlPatternElement>;
    'html-image': InstanceType<typeof HtmlImageElement>;
    'html-foreignobject': InstanceType<typeof HtmlForeignObjectElement>;
    'html-marker': InstanceType<typeof HtmlMarkerElement>;
    'html-title': InstanceType<typeof HtmlTitleElement>;
    'remote-style': InstanceType<typeof RemoteStyleElement>;
    'remote-root': InstanceType<typeof RemoteRootElement>;
    'remote-fragment': InstanceType<typeof RemoteFragmentElement>;
  }
}
