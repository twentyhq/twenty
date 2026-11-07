import { doNotTranslate } from 'twenty-shared/i18n';

export const PDF_FONT_FAMILIES = {
  REGULAR: doNotTranslate('Helvetica'),
  BOLD: doNotTranslate('Helvetica-Bold'),
  ITALIC: doNotTranslate('Helvetica-Oblique'),
  BOLD_ITALIC: doNotTranslate('Helvetica-BoldOblique'),
  MONOSPACE: doNotTranslate('Courier'),
} as const;
