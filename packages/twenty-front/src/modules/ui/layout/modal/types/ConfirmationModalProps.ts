import { type ReactNode } from 'react';
import { type ButtonColor } from 'twenty-ui/primitives/input';
import { type ModalOverlay } from 'twenty-ui/primitives/surfaces';

export type ConfirmationModalProps = {
  modalInstanceId: string;
  title: string;
  loading?: boolean;
  subtitle: ReactNode;
  onClose?: () => void;
  onConfirmClick: () => void;
  confirmButtonText?: string;
  confirmationPlaceholder?: string;
  confirmationValue?: string;
  confirmButtonColor?: ButtonColor;
  AdditionalButtons?: ReactNode;
  hideCancelButton?: boolean;
  overlay?: ModalOverlay;
};
