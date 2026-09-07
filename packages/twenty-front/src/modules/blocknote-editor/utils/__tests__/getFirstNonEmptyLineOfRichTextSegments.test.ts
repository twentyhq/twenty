import type { PartialBlock } from '@blocknote/core';

import {
  getFirstNonEmptyLineOfRichTextSegments,
  getRichTextPreviewSegmentStyle,
} from '@/blocknote-editor/utils/getFirstNonEmptyLineOfRichTextSegments';

describe('getFirstNonEmptyLineOfRichTextSegments', () => {
  it('returns an empty array if the input is null', () => {
    expect(getFirstNonEmptyLineOfRichTextSegments(null)).toEqual([]);
  });

  it('keeps strike on the first non-empty line', () => {
    const input: PartialBlock[] = [
      { content: [{ text: '', type: 'text', styles: {} }] },
      {
        content: [
          {
            text: 'cancelled meeting',
            type: 'text',
            styles: { strike: true },
          },
        ],
      },
    ];

    expect(getFirstNonEmptyLineOfRichTextSegments(input)).toEqual([
      { text: 'cancelled meeting', styles: { strike: true } },
    ]);
  });

  it('keeps mixed styles across inlines on the first line', () => {
    const input: PartialBlock[] = [
      {
        content: [
          { text: 'Keep ', type: 'text', styles: {} },
          { text: 'this', type: 'text', styles: { strike: true } },
          { text: 'that', type: 'text', styles: { underline: true } },
        ],
      },
    ];

    expect(getFirstNonEmptyLineOfRichTextSegments(input)).toEqual([
      { text: 'Keep ', styles: {} },
      { text: 'this', styles: { strike: true } },
      { text: 'that', styles: { underline: true } },
    ]);
  });
});

describe('getRichTextPreviewSegmentStyle', () => {
  it('maps strike to line-through', () => {
    expect(getRichTextPreviewSegmentStyle({ strike: true })).toEqual({
      textDecorationLine: 'line-through',
    });
  });

  it('maps underline and strike onto one text-decoration-line', () => {
    expect(
      getRichTextPreviewSegmentStyle({
        underline: true,
        strike: true,
      }),
    ).toEqual({
      textDecorationLine: 'underline line-through',
    });
  });
});
