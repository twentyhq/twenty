import { type ReactNode } from 'react';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ButtonAccent } from 'twenty-ui/input';

export type ConfirmationModalManagerConfig = {
  title: string;
  subtitle: ReactNode;
  onConfirmClick: () => void | Promise<void>;
  confirmButtonText?: string;
  confirmButtonAccent?: ButtonAccent;
};

export const confirmationModalManagerState =
  createAtomState<ConfirmationModalManagerConfig | null>({
    key: 'confirmationModalManagerState',
    defaultValue: null,
  });
