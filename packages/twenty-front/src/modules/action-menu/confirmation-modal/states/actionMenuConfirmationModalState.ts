import { type ReactNode } from 'react';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ButtonAccent } from 'twenty-ui/input';

export type ActionMenuConfirmationModalConfig = {
  title: string;
  subtitle: ReactNode;
  onConfirmClick: () => void | Promise<void>;
  confirmButtonText?: string;
  confirmButtonAccent?: ButtonAccent;
};

export const actionMenuConfirmationModalState =
  createAtomState<ActionMenuConfirmationModalConfig | null>({
    key: 'actionMenuConfirmationModalState',
    defaultValue: null,
  });
