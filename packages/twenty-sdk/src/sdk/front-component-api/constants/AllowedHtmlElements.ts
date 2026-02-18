type PropertySchema = {
  type: 'string' | 'number' | 'boolean';
  optional: boolean;
};

export type AllowedHtmlElement = {
  tag: string;
  name: string;
  properties: Record<string, PropertySchema>;
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
];
