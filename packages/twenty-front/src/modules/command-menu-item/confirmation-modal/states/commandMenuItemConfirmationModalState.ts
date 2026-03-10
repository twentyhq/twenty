import { type ReactNode } from 'react';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ButtonAccent } from 'twenty-ui/input';

export type CommandMenuItemConfirmationModalConfig = {
  frontComponentId: string;
  title: string;
  subtitle: ReactNode;
  confirmButtonText?: string;
  confirmButtonAccent?: ButtonAccent;
};

export const commandMenuItemConfirmationModalConfigState =
  createAtomState<CommandMenuItemConfirmationModalConfig | null>({
    key: 'commandMenuItemConfirmationModalConfigState',
    defaultValue: null,
  });
