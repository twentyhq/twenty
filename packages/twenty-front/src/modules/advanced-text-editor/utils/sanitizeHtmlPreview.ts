// The raw HTML block preview renders author-provided markup into the app's
// real DOM, where - unlike in an email client - scripts, event handlers and
// javascript: URLs would execute in the viewer's session. Sanitizing through
// DOMParser instead of regexes matters: parsing is inert (nothing runs), and
// entities are decoded first, so tricks like jav&#x61;script: or attributes
// without leading whitespace cannot slip through a pattern.
const BLOCKED_ELEMENT_SELECTOR =
  'script, iframe, frame, object, embed, link, meta, base';

const URL_ATTRIBUTE_NAMES = ['href', 'src', 'xlink:href', 'action'];

const isBlockedUrl = (attributeName: string, rawValue: string): boolean => {
  // Browsers ignore control characters and whitespace inside URL schemes.
  const value = rawValue.replace(/[\u0000-\u0020]/g, '').toLowerCase();

  if (attributeName === 'src' && value.startsWith('data:image/')) {
    return false;
  }

  return (
    value.startsWith('javascript:') ||
    value.startsWith('vbscript:') ||
    value.startsWith('data:')
  );
};

export const sanitizeHtmlPreview = (html: string): string => {
  const document = new DOMParser().parseFromString(html, 'text/html');

  document
    .querySelectorAll(BLOCKED_ELEMENT_SELECTOR)
    .forEach((element) => element.remove());

  document.body.querySelectorAll('*').forEach((element) => {
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();

      if (name.startsWith('on') || name === 'srcdoc' || name === 'formaction') {
        element.removeAttribute(attribute.name);
        continue;
      }

      if (
        URL_ATTRIBUTE_NAMES.includes(name) &&
        isBlockedUrl(name, attribute.value)
      ) {
        element.removeAttribute(attribute.name);
      }
    }
  });

  return document.body.innerHTML;
};
