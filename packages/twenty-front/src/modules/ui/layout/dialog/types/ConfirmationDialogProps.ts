import { type ReactNode } from 'react';
import {
  type ButtonColor,
  type ButtonVariant,
} from 'twenty-ui/primitives/input';

export type ConfirmationDialogProps = {
  dialogId: string;
  children?: ReactNode;
  title: string;
  loading?: boolean;
  isConfirmButtonDisabled?: boolean;
  subtitle: ReactNode;
  onClose?: () => void;
  onConfirmClick: () => void;
  confirmButtonText?: string;
  confirmationPlaceholder?: string;
  confirmationValue?: string;
  confirmButtonColor?: ButtonColor;
  confirmButtonVariant?: ButtonVariant;
  closeOnConfirm?: boolean;
  confirmOnEnter?: boolean;
  AdditionalButtons?: ReactNode;
  hideCancelButton?: boolean;
};
