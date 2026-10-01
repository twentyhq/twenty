export type SelectorElementLike = {
  nodeType?: number;
  localName?: string;
  parentNode?: unknown;
  previousElementSibling?: unknown;
  nextElementSibling?: unknown;
  childNodes?: ArrayLike<unknown>;
  attributes?: Iterable<unknown>;
  textContent?: unknown;
  value?: unknown;
  checked?: unknown;
  disabled?: unknown;
  selected?: unknown;
  indeterminate?: unknown;
  getAttribute?: (attributeName: string) => string | null;
};
