import { type ReactNode } from 'react';
import { type MarkType } from 'src/utils/email-renderer/email-renderer';

export const underline = (_: MarkType, text: ReactNode): ReactNode => {
  return <u>{text}</u>;
};
