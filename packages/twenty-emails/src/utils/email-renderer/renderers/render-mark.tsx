import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import {
    type TipTapMark,
    type TipTapMarkType,
    TIPTAP_MARKS_RENDER_ORDER,
    TIPTAP_MARK_TYPES,
} from 'twenty-shared/utils';
import { bold } from '../marks/bold';
import { italic } from '../marks/italic';
import { link } from '../marks/link';
import { strike } from '../marks/strike';
import { underline } from '../marks/underline';

const MARK_RENDERERS = {
  [TIPTAP_MARK_TYPES.BOLD]: bold,
  [TIPTAP_MARK_TYPES.ITALIC]: italic,
  [TIPTAP_MARK_TYPES.UNDERLINE]: underline,
  [TIPTAP_MARK_TYPES.STRIKE]: strike,
  [TIPTAP_MARK_TYPES.LINK]: link,
} as const;

export const renderMark = (node: JSONContent): ReactNode => {
  const text = node?.text || <>&nbsp;</>;
  const marks = (node?.marks as TipTapMark[]) || [];

  // Sort marks according to the defined render order
  marks.sort((a, b) => {
    return (
      TIPTAP_MARKS_RENDER_ORDER.indexOf(a.type) -
      TIPTAP_MARKS_RENDER_ORDER.indexOf(b.type)
    );
  });

  // Apply marks from innermost to outermost
  return marks.reduce((children: ReactNode, mark: TipTapMark) => {
    const renderer = MARK_RENDERERS[mark.type as TipTapMarkType];

    if (!renderer) {
      // Fallback for unknown mark types - skip unknown marks
      return children;
    }

    return renderer(mark, children);
  }, text);
};
