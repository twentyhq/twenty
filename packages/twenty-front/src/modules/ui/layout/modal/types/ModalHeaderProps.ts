import type React from 'react';

export type ModalHeaderProps = React.PropsWithChildren & {
  noPadding?: boolean;
  autoHeight?: boolean;
  hasBorderBottom?: boolean;
  paddingHorizontal?: number;
  backgroundColor?: string;
};
