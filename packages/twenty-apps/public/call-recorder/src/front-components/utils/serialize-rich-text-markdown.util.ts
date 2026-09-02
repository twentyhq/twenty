import { isNonEmptyString } from '@sniptt/guards';

// The settings tab stores RICH_TEXT variables as the blocknote/markdown pair
// produced by Twenty's rich text editor, so plain markdown has to be wrapped
// back into that shape to stay readable by both editors.
export const serializeRichTextMarkdown = (markdown: string): string =>
  isNonEmptyString(markdown)
    ? JSON.stringify({ blocknote: null, markdown })
    : '';
