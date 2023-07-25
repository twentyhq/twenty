import React from 'react';

import { Modal as UIModal } from '@/ui/modal/components/Modal';

type Props = React.ComponentProps<'div'>;

export function AuthModal({ children, ...restProps }: Props) {
  return (
    <UIModal isOpen={true} {...restProps}>
      {children}
    </UIModal>
  );
}
