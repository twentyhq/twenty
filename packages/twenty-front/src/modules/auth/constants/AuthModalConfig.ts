import { AppPath } from '@/types/AppPath';
import { ModalSize, ModalVariants } from '@/ui/layout/modal/components/Modal';

type AuthModalConfigType = {
  size: ModalSize;
  variant: ModalVariants;
  showScrollWrapper: boolean;
};

export const AUTH_MODAL_CONFIG: {
  default: AuthModalConfigType;
  [key: string]: AuthModalConfigType;
} = {
  default: {
    size: 'medium',
    variant: 'primary',
    showScrollWrapper: true,
  },
  [AppPath.BookCall]: {
    size: 'extraLarge',
    variant: 'transparent',
    showScrollWrapper: false,
  },
};
