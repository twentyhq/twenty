import { type ComponentPropsWithRef } from 'react';

import { type ModalOverlay } from '@/ui/layout/modal/types/ModalOverlay';

export type ModalBackdropProps = ComponentPropsWithRef<'div'> & {
  overlay: ModalOverlay;
  backdropZIndex: number;
  isInContainer?: boolean;
};
