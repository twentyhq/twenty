import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import {
  type EmailDocumentMarkType,
  isEmailDocumentMarkType,
  type TipTapMark,
  TIPTAP_MARK_TYPES,
  TIPTAP_MARKS_RENDER_ORDER,
} from 'twenty-shared/utils';
import { bold } from '@/utils/email-renderer/marks/bold';
import { italic } from '@/utils/email-renderer/marks/italic';
import { link } from '@/utils/email-renderer/marks/link';
import { strike } from '@/utils/email-renderer/marks/strike';
import { underline } from '@/utils/email-renderer/marks/underline';

const MARK_RENDERERS = {
  [TIPTAP_MARK_TYPES.BOLD]: bold,
  [TIPTAP_MARK_TYPES.ITALIC]: italic,
  [TIPTAP_MARK_TYPES.UNDERLINE]: underline,
  [TIPTAP_MARK_TYPES.STRIKE]: strike,
  [TIPTAP_MARK_TYPES.LINK]: link,
} as const satisfies Record<
  EmailDocumentMarkType,
  (mark: TipTapMark, children: ReactNode) => ReactNode
>;

export const renderMark = (node: JSONContent): ReactNode => {
  const text = node?.text || <>&nbsp;</>;
  const marks = [...((node?.marks as TipTapMark[]) || [])];

  marks.sort((a, b) => {
    return (
      TIPTAP_MARKS_RENDER_ORDER.indexOf(a.type) -
      TIPTAP_MARKS_RENDER_ORDER.indexOf(b.type)
    );
  });

  return marks.reduce((children: ReactNode, mark: TipTapMark) => {
    if (!isEmailDocumentMarkType(mark.type)) {
      return children;
    }

    return MARK_RENDERERS[mark.type](mark, children);
  }, text);
};
