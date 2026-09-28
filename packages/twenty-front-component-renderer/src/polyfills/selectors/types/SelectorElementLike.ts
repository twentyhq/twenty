export type SelectorElementLike = {
  nodeType?: number;
  localName?: string;
  parentNode?: unknown;
  previousElementSibling?: unknown;
  nextElementSibling?: unknown;
  childNodes?: ArrayLike<unknown>;
  attributes?: Iterable<unknown>;
  textContent?: unknown;
  getAttribute?: (attributeName: string) => string | null;
};
