import { type ReactNode } from 'react';
import { type MarkType } from '../email-renderer';

export const bold = (_: MarkType, text: ReactNode): ReactNode => {
  return <strong>{text}</strong>;
};
