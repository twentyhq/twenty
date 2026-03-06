import { type ReactNode } from 'react';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ButtonAccent } from 'twenty-ui/input';

export type ActionMenuConfirmationModalConfig = {
  frontComponentId: string;
  title: string;
  subtitle: ReactNode;
  confirmButtonText?: string;
  confirmButtonAccent?: ButtonAccent;
};

export const actionMenuConfirmationModalConfigState =
  createAtomState<ActionMenuConfirmationModalConfig | null>({
    key: 'actionMenuConfirmationModalConfigState',
    defaultValue: null,
  });
