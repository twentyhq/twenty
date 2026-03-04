import React from 'react';
import { type ModalProps } from 'twenty-ui/layout';

export type ModalStatefulWrapperProps = Pick<
  ModalProps,
  'size' | 'padding' | 'overlay' | 'gap' | 'smallBorderRadius' | 'narrowWidth' | 'autoHeight'
> &
  React.PropsWithChildren & {
    modalInstanceId: string;
    onEnter?: () => void;
    dataGloballyPreventClickOutside?: boolean;
    shouldCloseModalOnClickOutsideOrEscape?: boolean;
    ignoreContainer?: boolean;
  } & (
    | { isClosable: true; onClose?: () => void }
    | { isClosable?: false; onClose?: never }
  );
