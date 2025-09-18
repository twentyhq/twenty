import { type ReactNode } from 'react';
import { type MarkType } from 'src/utils/email-renderer/email-renderer';

export const italic = (_: MarkType, text: ReactNode): ReactNode => {
  return <em>{text}</em>;
};
