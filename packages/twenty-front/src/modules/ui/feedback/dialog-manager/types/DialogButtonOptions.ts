import { type ComponentProps, type MouseEvent } from 'react';
import { type Button } from 'twenty-ui/primitives/input';

export type DialogButtonOptions = Omit<
  ComponentProps<typeof Button>,
  'fullWidth' | 'onClick'
> & {
  onClick?: (event: MouseEvent<HTMLButtonElement> | KeyboardEvent) => void;
  role?: 'confirm';
};
