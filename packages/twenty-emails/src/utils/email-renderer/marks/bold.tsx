import { type ReactNode } from 'react';
import { type TipTapMark } from 'twenty-shared/utils';

export const bold = (_: TipTapMark, children: ReactNode): ReactNode => {
  return <strong>{children}</strong>;
};
