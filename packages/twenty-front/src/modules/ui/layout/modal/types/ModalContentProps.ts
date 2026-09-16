import type React from 'react';

export type ModalContentProps = React.PropsWithChildren & {
  isVerticallyCentered?: boolean;
  isHorizontallyCentered?: boolean;
  noPadding?: boolean;
  overflowHidden?: boolean;
  gap?: number;
  contentPadding?: number;
};
