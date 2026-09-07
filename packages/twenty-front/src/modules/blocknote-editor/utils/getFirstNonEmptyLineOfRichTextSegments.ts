import type { PartialBlock } from '@blocknote/core';
import { isDefined } from 'twenty-shared/utils';

const PREVIEW_STYLE_KEYS = [
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
] as const;

type RichTextPreviewStyleKey = (typeof PREVIEW_STYLE_KEYS)[number];

export type RichTextPreviewStyles = {
  [styleKey in RichTextPreviewStyleKey]?: boolean;
};

export type RichTextPreviewSegment = {
  text: string;
  styles: RichTextPreviewStyles;
};

type BlockNoteInline = {
  type?: string;
  text?: string;
  styles?: Record<string, unknown>;
  content?: BlockNoteInline[];
};

export type RichTextPreviewSegmentStyle = {
  fontWeight?: 'bold';
  fontStyle?: 'italic';
  textDecorationLine?: string;
  fontFamily?: 'monospace';
};

export const getRichTextPreviewSegmentStyle = (
  styles: RichTextPreviewStyles,
): RichTextPreviewSegmentStyle => {
  const textDecorationLine = [
    styles.underline === true ? 'underline' : undefined,
    styles.strike === true ? 'line-through' : undefined,
  ]
    .filter(isDefined)
    .join(' ');

  return {
    ...(styles.bold === true ? { fontWeight: 'bold' } : {}),
    ...(styles.italic === true ? { fontStyle: 'italic' } : {}),
    ...(textDecorationLine.length > 0 ? { textDecorationLine } : {}),
    ...(styles.code === true ? { fontFamily: 'monospace' } : {}),
  };
};

const getPreviewStyles = (
  styles: Record<string, unknown> | undefined,
): RichTextPreviewStyles => {
  if (!isDefined(styles)) {
    return {};
  }

  return PREVIEW_STYLE_KEYS.reduce<RichTextPreviewStyles>(
    (previewStyles, styleKey) => {
      if (styles[styleKey] === true) {
        return { ...previewStyles, [styleKey]: true };
      }

      return previewStyles;
    },
    {},
  );
};

const getSegmentsFromInline = (
  inline: BlockNoteInline,
): RichTextPreviewSegment[] => {
  if (inline.type === 'link' && Array.isArray(inline.content)) {
    return inline.content.flatMap(getSegmentsFromInline);
  }

  if (!isDefined(inline.text) || inline.text === '') {
    return [];
  }

  return [
    {
      text: inline.text,
      styles: getPreviewStyles(inline.styles),
    },
  ];
};

const getSegmentsFromContent = (
  content: PartialBlock['content'],
): RichTextPreviewSegment[] => {
  if (typeof content === 'string') {
    return content.trim() === '' ? [] : [{ text: content, styles: {} }];
  }

  if (!isDefined(content)) {
    return [];
  }

  const contentItems = Array.isArray(content) ? content : [content];

  return contentItems.flatMap((contentItem) =>
    getSegmentsFromInline(contentItem as BlockNoteInline),
  );
};

export const getFirstNonEmptyLineOfRichTextSegments = (
  blocks: PartialBlock[] | null,
): RichTextPreviewSegment[] => {
  if (!isDefined(blocks)) {
    return [];
  }

  for (const block of blocks) {
    const segments = getSegmentsFromContent(block.content);
    const lineText = segments.map((segment) => segment.text).join('');

    if (lineText.trim() !== '') {
      return segments;
    }
  }

  return [];
};
