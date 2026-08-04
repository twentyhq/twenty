const BLOCKED_ELEMENT_SELECTOR =
  'script, iframe, frame, object, embed, link, meta, base';

const URL_ATTRIBUTE_NAMES = ['href', 'src', 'xlink:href', 'action'];

const isBlockedUrl = (attributeName: string, rawValue: string): boolean => {
  const value = rawValue.replace(/[\u0000-\u0020]/g, '').toLowerCase();

  if (attributeName === 'src' && value.startsWith('data:image/')) {
    return false;
  }

  return (
    // oxlint-disable-next-line no-script-url -- this is the sanitizer's blocklist
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
