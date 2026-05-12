import { type PropertySchema } from './PropertySchema';
import { SVG_PRESENTATION_PROPERTIES } from './SvgPresentationProperties';

export type AllowedHtmlElement = {
  tag: string;
  name: string;
  properties: Record<string, PropertySchema>;
  events?: string[];
  htmlTag?: string;
};

export const ALLOWED_HTML_ELEMENTS: AllowedHtmlElement[] = [
  { tag: 'html-div', name: 'HtmlDiv', properties: {} },
  { tag: 'html-span', name: 'HtmlSpan', properties: {} },
  { tag: 'html-section', name: 'HtmlSection', properties: {} },
  { tag: 'html-article', name: 'HtmlArticle', properties: {} },
  { tag: 'html-header', name: 'HtmlHeader', properties: {} },
  { tag: 'html-footer', name: 'HtmlFooter', properties: {} },
  { tag: 'html-main', name: 'HtmlMain', properties: {} },
  { tag: 'html-nav', name: 'HtmlNav', properties: {} },
  { tag: 'html-aside', name: 'HtmlAside', properties: {} },
  { tag: 'html-p', name: 'HtmlP', properties: {} },
  { tag: 'html-h1', name: 'HtmlH1', properties: {} },
  { tag: 'html-h2', name: 'HtmlH2', properties: {} },
  { tag: 'html-h3', name: 'HtmlH3', properties: {} },
  { tag: 'html-h4', name: 'HtmlH4', properties: {} },
  { tag: 'html-h5', name: 'HtmlH5', properties: {} },
  { tag: 'html-h6', name: 'HtmlH6', properties: {} },
  { tag: 'html-strong', name: 'HtmlStrong', properties: {} },
  { tag: 'html-em', name: 'HtmlEm', properties: {} },
  { tag: 'html-small', name: 'HtmlSmall', properties: {} },
  { tag: 'html-code', name: 'HtmlCode', properties: {} },
  { tag: 'html-pre', name: 'HtmlPre', properties: {} },
  { tag: 'html-blockquote', name: 'HtmlBlockquote', properties: {} },
  {
    tag: 'html-a',
    name: 'HtmlA',
    properties: {
      href: { type: 'string', optional: true },
      target: { type: 'string', optional: true },
      rel: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-img',
    name: 'HtmlImg',
    properties: {
      src: { type: 'string', optional: true },
      alt: { type: 'string', optional: true },
      width: { type: 'number', optional: true },
      height: { type: 'number', optional: true },
    },
  },
  { tag: 'html-ul', name: 'HtmlUl', properties: {} },
  { tag: 'html-ol', name: 'HtmlOl', properties: {} },
  { tag: 'html-li', name: 'HtmlLi', properties: {} },
  {
    tag: 'html-form',
    name: 'HtmlForm',
    properties: {
      action: { type: 'string', optional: true },
      method: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-label',
    name: 'HtmlLabel',
    properties: {
      htmlFor: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-input',
    name: 'HtmlInput',
    properties: {
      type: { type: 'string', optional: true },
      name: { type: 'string', optional: true },
      value: { type: 'string', optional: true },
      placeholder: { type: 'string', optional: true },
      disabled: { type: 'boolean', optional: true },
      checked: { type: 'boolean', optional: true },
      readOnly: { type: 'boolean', optional: true },
      accept: { type: 'string', optional: true },
      multiple: { type: 'boolean', optional: true },
      capture: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-textarea',
    name: 'HtmlTextarea',
    properties: {
      name: { type: 'string', optional: true },
      value: { type: 'string', optional: true },
      placeholder: { type: 'string', optional: true },
      disabled: { type: 'boolean', optional: true },
      readOnly: { type: 'boolean', optional: true },
      rows: { type: 'number', optional: true },
      cols: { type: 'number', optional: true },
    },
  },
  {
    tag: 'html-select',
    name: 'HtmlSelect',
    properties: {
      name: { type: 'string', optional: true },
      value: { type: 'string', optional: true },
      disabled: { type: 'boolean', optional: true },
      multiple: { type: 'boolean', optional: true },
    },
  },
  {
    tag: 'html-option',
    name: 'HtmlOption',
    properties: {
      value: { type: 'string', optional: true },
      disabled: { type: 'boolean', optional: true },
      selected: { type: 'boolean', optional: true },
    },
  },
  {
    tag: 'html-button',
    name: 'HtmlButton',
    properties: {
      type: { type: 'string', optional: true },
      disabled: { type: 'boolean', optional: true },
    },
  },
  { tag: 'html-table', name: 'HtmlTable', properties: {} },
  { tag: 'html-thead', name: 'HtmlThead', properties: {} },
  { tag: 'html-tbody', name: 'HtmlTbody', properties: {} },
  { tag: 'html-tfoot', name: 'HtmlTfoot', properties: {} },
  { tag: 'html-tr', name: 'HtmlTr', properties: {} },
  {
    tag: 'html-th',
    name: 'HtmlTh',
    properties: {
      colSpan: { type: 'number', optional: true },
      rowSpan: { type: 'number', optional: true },
    },
  },
  {
    tag: 'html-td',
    name: 'HtmlTd',
    properties: {
      colSpan: { type: 'number', optional: true },
      rowSpan: { type: 'number', optional: true },
    },
  },
  { tag: 'html-br', name: 'HtmlBr', properties: {} },
  { tag: 'html-hr', name: 'HtmlHr', properties: {} },
  {
    tag: 'html-iframe',
    name: 'HtmlIframe',
    properties: {
      src: { type: 'string', optional: true },
      name: { type: 'string', optional: true },
      width: { type: 'string', optional: true },
      height: { type: 'string', optional: true },
      allow: { type: 'string', optional: true },
      sandbox: { type: 'string', optional: true },
      allowFullScreen: { type: 'boolean', optional: true },
      loading: { type: 'string', optional: true },
      referrerPolicy: { type: 'string', optional: true },
      srcDoc: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-video',
    name: 'HtmlVideo',
    properties: {
      src: { type: 'string', optional: true },
      poster: { type: 'string', optional: true },
      controls: { type: 'boolean', optional: true },
      autoPlay: { type: 'boolean', optional: true },
      loop: { type: 'boolean', optional: true },
      muted: { type: 'boolean', optional: true },
      preload: { type: 'string', optional: true },
      width: { type: 'string', optional: true },
      height: { type: 'string', optional: true },
      crossOrigin: { type: 'string', optional: true },
      playsInline: { type: 'boolean', optional: true },
      disablePictureInPicture: { type: 'boolean', optional: true },
      disableRemotePlayback: { type: 'boolean', optional: true },
    },
    events: [
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
  },
  {
    tag: 'html-audio',
    name: 'HtmlAudio',
    properties: {
      src: { type: 'string', optional: true },
      controls: { type: 'boolean', optional: true },
      autoPlay: { type: 'boolean', optional: true },
      loop: { type: 'boolean', optional: true },
      muted: { type: 'boolean', optional: true },
      preload: { type: 'string', optional: true },
      crossOrigin: { type: 'string', optional: true },
    },
    events: [
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
  },
  {
    tag: 'html-source',
    name: 'HtmlSource',
    properties: {
      src: { type: 'string', optional: true },
      type: { type: 'string', optional: true },
      media: { type: 'string', optional: true },
      srcSet: { type: 'string', optional: true },
      sizes: { type: 'string', optional: true },
      width: { type: 'number', optional: true },
      height: { type: 'number', optional: true },
    },
  },

  // Semantic inline text
  { tag: 'html-b', name: 'HtmlB', properties: {} },
  { tag: 'html-i', name: 'HtmlI', properties: {} },
  { tag: 'html-u', name: 'HtmlU', properties: {} },
  { tag: 'html-s', name: 'HtmlS', properties: {} },
  { tag: 'html-mark', name: 'HtmlMark', properties: {} },
  { tag: 'html-sub', name: 'HtmlSub', properties: {} },
  { tag: 'html-sup', name: 'HtmlSup', properties: {} },
  { tag: 'html-abbr', name: 'HtmlAbbr', properties: {} },
  { tag: 'html-cite', name: 'HtmlCite', properties: {} },
  { tag: 'html-kbd', name: 'HtmlKbd', properties: {} },
  { tag: 'html-samp', name: 'HtmlSamp', properties: {} },
  { tag: 'html-var', name: 'HtmlVar', properties: {} },
  { tag: 'html-dfn', name: 'HtmlDfn', properties: {} },
  { tag: 'html-bdi', name: 'HtmlBdi', properties: {} },
  {
    tag: 'html-bdo',
    name: 'HtmlBdo',
    properties: {
      dir: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-data',
    name: 'HtmlData',
    properties: {
      value: { type: 'string', optional: true },
    },
  },

  // Edited/annotated text
  {
    tag: 'html-del',
    name: 'HtmlDel',
    properties: {
      cite: { type: 'string', optional: true },
      dateTime: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-ins',
    name: 'HtmlIns',
    properties: {
      cite: { type: 'string', optional: true },
      dateTime: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-q',
    name: 'HtmlQ',
    properties: {
      cite: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-time',
    name: 'HtmlTime',
    properties: {
      dateTime: { type: 'string', optional: true },
    },
  },

  // Ruby annotations
  { tag: 'html-ruby', name: 'HtmlRuby', properties: {} },
  { tag: 'html-rt', name: 'HtmlRt', properties: {} },
  { tag: 'html-rp', name: 'HtmlRp', properties: {} },

  // Description lists
  { tag: 'html-dl', name: 'HtmlDl', properties: {} },
  { tag: 'html-dt', name: 'HtmlDt', properties: {} },
  { tag: 'html-dd', name: 'HtmlDd', properties: {} },

  // Structural/semantic
  { tag: 'html-figure', name: 'HtmlFigure', properties: {} },
  { tag: 'html-figcaption', name: 'HtmlFigcaption', properties: {} },
  {
    tag: 'html-details',
    name: 'HtmlDetails',
    properties: {
      open: { type: 'boolean', optional: true },
    },
  },
  { tag: 'html-summary', name: 'HtmlSummary', properties: {} },
  { tag: 'html-address', name: 'HtmlAddress', properties: {} },
  {
    tag: 'html-dialog',
    name: 'HtmlDialog',
    properties: {
      open: { type: 'boolean', optional: true },
    },
  },
  { tag: 'html-hgroup', name: 'HtmlHgroup', properties: {} },
  { tag: 'html-search', name: 'HtmlSearch', properties: {} },

  // Table additions
  { tag: 'html-caption', name: 'HtmlCaption', properties: {} },
  {
    tag: 'html-colgroup',
    name: 'HtmlColgroup',
    properties: {
      span: { type: 'number', optional: true },
    },
  },
  {
    tag: 'html-col',
    name: 'HtmlCol',
    properties: {
      span: { type: 'number', optional: true },
    },
  },

  // Form additions
  {
    tag: 'html-fieldset',
    name: 'HtmlFieldset',
    properties: {
      disabled: { type: 'boolean', optional: true },
      name: { type: 'string', optional: true },
    },
  },
  { tag: 'html-legend', name: 'HtmlLegend', properties: {} },
  {
    tag: 'html-output',
    name: 'HtmlOutput',
    properties: {
      name: { type: 'string', optional: true },
      htmlFor: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-progress',
    name: 'HtmlProgress',
    properties: {
      value: { type: 'number', optional: true },
      max: { type: 'number', optional: true },
    },
  },
  {
    tag: 'html-meter',
    name: 'HtmlMeter',
    properties: {
      value: { type: 'number', optional: true },
      min: { type: 'number', optional: true },
      max: { type: 'number', optional: true },
      low: { type: 'number', optional: true },
      high: { type: 'number', optional: true },
      optimum: { type: 'number', optional: true },
    },
  },
  {
    tag: 'html-optgroup',
    name: 'HtmlOptgroup',
    properties: {
      label: { type: 'string', optional: true },
      disabled: { type: 'boolean', optional: true },
    },
  },
  { tag: 'html-datalist', name: 'HtmlDatalist', properties: {} },

  // Media additions
  { tag: 'html-picture', name: 'HtmlPicture', properties: {} },
  {
    tag: 'html-track',
    name: 'HtmlTrack',
    properties: {
      src: { type: 'string', optional: true },
      kind: { type: 'string', optional: true },
      srclang: { type: 'string', optional: true },
      label: { type: 'string', optional: true },
      default: { type: 'boolean', optional: true },
    },
  },

  // Miscellaneous
  { tag: 'html-wbr', name: 'HtmlWbr', properties: {} },
  { tag: 'html-menu', name: 'HtmlMenu', properties: {} },

  // SVG container/structural
  {
    tag: 'html-svg',
    name: 'HtmlSvg',
    properties: {
      ...SVG_PRESENTATION_PROPERTIES,
      viewBox: { type: 'string', optional: true },
      xmlns: { type: 'string', optional: true },
      width: { type: 'string', optional: true },
      height: { type: 'string', optional: true },
      preserveAspectRatio: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-g',
    name: 'HtmlG',
    properties: {
      ...SVG_PRESENTATION_PROPERTIES,
    },
  },
  { tag: 'html-defs', name: 'HtmlDefs', properties: {} },
  {
    tag: 'html-symbol',
    name: 'HtmlSymbol',
    properties: {
      viewBox: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-use',
    name: 'HtmlUse',
    properties: {
      href: { type: 'string', optional: true },
      x: { type: 'string', optional: true },
      y: { type: 'string', optional: true },
      width: { type: 'string', optional: true },
      height: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-clippath',
    name: 'HtmlClipPath',
    htmlTag: 'clipPath',
    properties: {
      clipPathUnits: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-mask',
    name: 'HtmlMask',
    properties: {
      maskUnits: { type: 'string', optional: true },
    },
  },

  // SVG shapes
  {
    tag: 'html-circle',
    name: 'HtmlCircle',
    properties: {
      ...SVG_PRESENTATION_PROPERTIES,
      cx: { type: 'string', optional: true },
      cy: { type: 'string', optional: true },
      r: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-ellipse',
    name: 'HtmlEllipse',
    properties: {
      ...SVG_PRESENTATION_PROPERTIES,
      cx: { type: 'string', optional: true },
      cy: { type: 'string', optional: true },
      rx: { type: 'string', optional: true },
      ry: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-rect',
    name: 'HtmlRect',
    properties: {
      ...SVG_PRESENTATION_PROPERTIES,
      x: { type: 'string', optional: true },
      y: { type: 'string', optional: true },
      width: { type: 'string', optional: true },
      height: { type: 'string', optional: true },
      rx: { type: 'string', optional: true },
      ry: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-line',
    name: 'HtmlLine',
    properties: {
      ...SVG_PRESENTATION_PROPERTIES,
      x1: { type: 'string', optional: true },
      y1: { type: 'string', optional: true },
      x2: { type: 'string', optional: true },
      y2: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-path',
    name: 'HtmlPath',
    properties: {
      ...SVG_PRESENTATION_PROPERTIES,
      d: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-polygon',
    name: 'HtmlPolygon',
    properties: {
      ...SVG_PRESENTATION_PROPERTIES,
      points: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-polyline',
    name: 'HtmlPolyline',
    properties: {
      ...SVG_PRESENTATION_PROPERTIES,
      points: { type: 'string', optional: true },
    },
  },

  // SVG text
  {
    tag: 'html-text',
    name: 'HtmlText',
    properties: {
      ...SVG_PRESENTATION_PROPERTIES,
      x: { type: 'string', optional: true },
      y: { type: 'string', optional: true },
      dx: { type: 'string', optional: true },
      dy: { type: 'string', optional: true },
      textAnchor: { type: 'string', optional: true },
      dominantBaseline: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-tspan',
    name: 'HtmlTspan',
    properties: {
      ...SVG_PRESENTATION_PROPERTIES,
      x: { type: 'string', optional: true },
      y: { type: 'string', optional: true },
      dx: { type: 'string', optional: true },
      dy: { type: 'string', optional: true },
    },
  },

  // SVG gradients/patterns
  {
    tag: 'html-lineargradient',
    name: 'HtmlLinearGradient',
    htmlTag: 'linearGradient',
    properties: {
      x1: { type: 'string', optional: true },
      y1: { type: 'string', optional: true },
      x2: { type: 'string', optional: true },
      y2: { type: 'string', optional: true },
      gradientUnits: { type: 'string', optional: true },
      gradientTransform: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-radialgradient',
    name: 'HtmlRadialGradient',
    htmlTag: 'radialGradient',
    properties: {
      cx: { type: 'string', optional: true },
      cy: { type: 'string', optional: true },
      r: { type: 'string', optional: true },
      fx: { type: 'string', optional: true },
      fy: { type: 'string', optional: true },
      gradientUnits: { type: 'string', optional: true },
      gradientTransform: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-stop',
    name: 'HtmlStop',
    properties: {
      offset: { type: 'string', optional: true },
      stopColor: { type: 'string', optional: true },
      stopOpacity: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-pattern',
    name: 'HtmlPattern',
    properties: {
      x: { type: 'string', optional: true },
      y: { type: 'string', optional: true },
      width: { type: 'string', optional: true },
      height: { type: 'string', optional: true },
      patternUnits: { type: 'string', optional: true },
      patternTransform: { type: 'string', optional: true },
    },
  },

  // SVG other
  {
    tag: 'html-image',
    name: 'HtmlImage',
    properties: {
      href: { type: 'string', optional: true },
      x: { type: 'string', optional: true },
      y: { type: 'string', optional: true },
      width: { type: 'string', optional: true },
      height: { type: 'string', optional: true },
      preserveAspectRatio: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-foreignobject',
    name: 'HtmlForeignObject',
    htmlTag: 'foreignObject',
    properties: {
      x: { type: 'string', optional: true },
      y: { type: 'string', optional: true },
      width: { type: 'string', optional: true },
      height: { type: 'string', optional: true },
    },
  },
  {
    tag: 'html-marker',
    name: 'HtmlMarker',
    properties: {
      markerWidth: { type: 'string', optional: true },
      markerHeight: { type: 'string', optional: true },
      refX: { type: 'string', optional: true },
      refY: { type: 'string', optional: true },
      orient: { type: 'string', optional: true },
      markerUnits: { type: 'string', optional: true },
    },
  },
  { tag: 'html-title', name: 'HtmlTitle', properties: {} },
];
