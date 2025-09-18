import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { type MarkType } from 'src/utils/email-renderer/email-renderer';
import { bold } from 'src/utils/email-renderer/marks/bold';
import { italic } from 'src/utils/email-renderer/marks/italic';
import { link } from 'src/utils/email-renderer/marks/link';
import { strike } from 'src/utils/email-renderer/marks/strike';
import { underline } from 'src/utils/email-renderer/marks/underline';

const MARKS_ORDER = ['underline', 'bold', 'italic', 'link', 'strike'];

export const renderMark = (node: JSONContent): ReactNode => {
  const text = node?.text || <>&nbsp;</>;
  const marks = node?.marks || [];
  marks.sort((a, b) => {
    return MARKS_ORDER.indexOf(a.type) - MARKS_ORDER.indexOf(b.type);
  });

  return marks.reduce(
    (_: ReactNode, mark: MarkType) => {
      const type = mark.type;

      switch (type) {
        case 'underline':
          return underline(mark, text);
        case 'bold':
          return bold(mark, text);
        case 'italic':
          return italic(mark, text);
        case 'strike':
          return strike(mark, text);
        case 'link':
          return link(mark, text);
        default:
          return <>{text}</>;
      }
    },
    <>{text}</>,
  );
};
