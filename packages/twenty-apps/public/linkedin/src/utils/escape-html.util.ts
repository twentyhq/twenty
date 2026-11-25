const HTML_ENTITY_BY_CHARACTER: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (text: string): string =>
  text.replace(
    /[&<>"']/g,
    (character) => HTML_ENTITY_BY_CHARACTER[character] ?? character,
  );
