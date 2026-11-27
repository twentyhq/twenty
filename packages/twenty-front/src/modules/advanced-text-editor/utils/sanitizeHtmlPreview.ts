import DOMPurify, { type Config } from 'dompurify';
import { doNotTranslate } from 'twenty-shared/i18n';

const LINK_TAG_NAMES = ['a', 'area'];

// The preview renders inside the app's own document, so page-wide styles and forms stay out.
const HTML_PREVIEW_SANITIZE_CONFIG: Config = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: [
    'style',
    'template',
    'form',
    'input',
    'button',
    'select',
    'textarea',
  ],
};

const htmlPreviewPurifier = DOMPurify();

htmlPreviewPurifier.addHook('afterSanitizeAttributes', (node) => {
  if (LINK_TAG_NAMES.includes(node.localName) && node.hasAttribute('href')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', doNotTranslate('noopener noreferrer'));
  }
});

export const sanitizeHtmlPreview = (html: string): string =>
  htmlPreviewPurifier.sanitize(html, HTML_PREVIEW_SANITIZE_CONFIG);
