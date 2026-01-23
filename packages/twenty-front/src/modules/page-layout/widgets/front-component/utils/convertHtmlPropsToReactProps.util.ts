// Maps HTML attribute names to React prop names
const HTML_TO_REACT_PROP_MAP: Record<string, string> = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  minlength: 'minLength',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  contenteditable: 'contentEditable',
  autocomplete: 'autoComplete',
  autofocus: 'autoFocus',
  autoplay: 'autoPlay',
  enctype: 'encType',
  datetime: 'dateTime',
};

export const convertHtmlPropsToReactProps = (
  props: Record<string, unknown>,
): Record<string, unknown> => {
  const reactProps: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    const reactKey = HTML_TO_REACT_PROP_MAP[key] ?? key;
    reactProps[reactKey] = value;
  }

  return reactProps;
};
