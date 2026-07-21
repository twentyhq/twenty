import type React from 'react';
import { type ModalProps } from 'twenty-ui/surfaces';

export type ModalStatefulWrapperProps = Pick<
  ModalProps,
  | 'size'
  | 'padding'
  | 'overlay'
  | 'gap'
  | 'smallBorderRadius'
  | 'narrowWidth'
  | 'autoHeight'
  | 'width'
> &
  React.PropsWithChildren & {
    modalInstanceId: string;
    onEnter?: () => void;
    dataGloballyPreventClickOutside?: boolean;
    shouldCloseModalOnClickOutsideOrEscape?: boolean;
    renderInDocumentBody?: boolean;
  } & (
    | { isClosable: true; onClose?: () => void }
    | { isClosable?: false; onClose?: never }
  );
