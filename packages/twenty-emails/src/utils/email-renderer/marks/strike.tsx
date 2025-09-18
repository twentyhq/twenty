import { type ReactNode } from 'react';
import { type MarkType } from 'src/utils/email-renderer/email-renderer';

export const strike = (_: MarkType, text: ReactNode): ReactNode => {
  return <s style={{ textDecoration: 'line-through' }}>{text}</s>;
};
