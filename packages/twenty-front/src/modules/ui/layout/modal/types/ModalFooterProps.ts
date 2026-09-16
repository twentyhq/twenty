import type React from 'react';

export type ModalFooterProps = React.PropsWithChildren & {
  autoHeight?: boolean;
  centered?: boolean;
  smallPadding?: boolean;
  className?: string;
};
