/* oxlint-disable twenty/no-hardcoded-colors --
   PDF documents are rendered outside the app and cannot read theme variables */
import { type RichTextColor } from 'twenty-shared/utils';

export const RICH_TEXT_PDF_COLORS: Record<
  RichTextColor,
  { text: string; background: string }
> = {
  gray: { text: '#646464', background: '#f0f0f0' },
  brown: { text: '#8a6c58', background: '#f6eee7' },
  red: { text: '#ce2c31', background: '#feebec' },
  orange: { text: '#cc4e00', background: '#ffefd6' },
  yellow: { text: '#9e6c00', background: '#fffab8' },
  green: { text: '#218358', background: '#e6f6eb' },
  blue: { text: '#0d74ce', background: '#e6f4fe' },
  purple: { text: '#8145b5', background: '#f7edfe' },
  pink: { text: '#c2298a', background: '#fee9f5' },
};
