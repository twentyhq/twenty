// Translation message primitives shared by the build-time extractor (node) and
// the runtime resolver (browser). Kept free of any react/node dependency so both
// sides can import it and agree byte-for-byte on how a catalog key is built.

export type MessageDescriptor = {
  message: string;
  context?: string;
};

export type TranslationValues = Record<string, string | number>;

// locale -> catalog key -> translated string
export type TranslationCatalogsByLocale = Record<
  string,
  Record<string, string>
>;

// Separates the disambiguation context from the source message inside a catalog
// key. A control character is used so it never clashes with real source strings,
// while keeping context-less keys equal to the raw message (backward compatible
// with the source-keyed catalogs the manifest pipeline already writes).
const CONTEXT_SEPARATOR = '\u0004';

export const normalizeMessageDescriptor = (
  descriptor: string | MessageDescriptor,
): MessageDescriptor =>
  typeof descriptor === 'string' ? { message: descriptor } : descriptor;

export const getTranslationCatalogKey = (
  message: string,
  context?: string,
): string =>
  context !== undefined && context.length > 0
    ? `${context}${CONTEXT_SEPARATOR}${message}`
    : message;

export const parseTranslationCatalogKey = (key: string): MessageDescriptor => {
  const separatorIndex = key.indexOf(CONTEXT_SEPARATOR);

  if (separatorIndex === -1) {
    return { message: key };
  }

  return {
    context: key.slice(0, separatorIndex),
    message: key.slice(separatorIndex + 1),
  };
};

// Collapses runs of whitespace (including newlines/indentation) to a single
// space and trims. Applied to <Trans> text children on BOTH the build-time
// extractor and the runtime so a multi-line element produces the same catalog
// key on each side: JSX collapses children whitespace at render, while the
// extractor reads the raw source, so both must normalize identically to agree.
export const normalizeMessageWhitespace = (text: string): string =>
  text.replace(/\s+/g, ' ').trim();

export const interpolateMessage = (
  template: string,
  values?: TranslationValues,
): string => {
  if (values === undefined) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    Object.prototype.hasOwnProperty.call(values, name)
      ? String(values[name])
      : placeholder,
  );
};
