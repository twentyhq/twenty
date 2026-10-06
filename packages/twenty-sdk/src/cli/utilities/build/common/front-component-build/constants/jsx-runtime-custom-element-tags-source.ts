export const JSX_RUNTIME_CUSTOM_ELEMENT_TAGS_SOURCE = `
export const customElementMap =
  globalThis.__HTML_TAG_TO_CUSTOM_ELEMENT_TAG__ || {};

const customElementTags = {};
for (const htmlTag in customElementMap) {
  customElementTags[customElementMap[htmlTag]] = true;
}

export function isCustomElementTag(type) {
  return typeof type === 'string' && customElementTags[type] === true;
}
`.trim();
