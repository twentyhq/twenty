import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import {
  EMAIL_DOCUMENT_MARK_TYPES,
  type EmailDocumentMarkType,
  isEmailDocumentMarkType,
  type TipTapMark,
  TIPTAP_MARKS_RENDER_ORDER,
} from 'twenty-shared/utils';
import { bold } from '@/utils/email-renderer/marks/bold';
import { italic } from '@/utils/email-renderer/marks/italic';
import { link } from '@/utils/email-renderer/marks/link';
import { strike } from '@/utils/email-renderer/marks/strike';
import { underline } from '@/utils/email-renderer/marks/underline';

const MARK_RENDERERS = {
  [EMAIL_DOCUMENT_MARK_TYPES.BOLD]: bold,
  [EMAIL_DOCUMENT_MARK_TYPES.ITALIC]: italic,
  [EMAIL_DOCUMENT_MARK_TYPES.UNDERLINE]: underline,
  [EMAIL_DOCUMENT_MARK_TYPES.STRIKE]: strike,
  [EMAIL_DOCUMENT_MARK_TYPES.LINK]: link,
} as const satisfies Record<
  EmailDocumentMarkType,
  (mark: TipTapMark, children: ReactNode) => ReactNode
>;

export const renderMark = (node: JSONContent): ReactNode => {
  const text = node?.text || <>&nbsp;</>;
  const marks = [...((node?.marks as TipTapMark[]) || [])];

  // Sort marks according to the defined render order
  marks.sort((a, b) => {
    return (
      TIPTAP_MARKS_RENDER_ORDER.indexOf(a.type) -
      TIPTAP_MARKS_RENDER_ORDER.indexOf(b.type)
    );
  });

  // Apply marks from innermost to outermost
  return marks.reduce((children: ReactNode, mark: TipTapMark) => {
    if (!isEmailDocumentMarkType(mark.type)) {
      // Fallback for unknown mark types - skip unknown marks
      return children;
    }

    return MARK_RENDERERS[mark.type](mark, children);
  }, text);
};
