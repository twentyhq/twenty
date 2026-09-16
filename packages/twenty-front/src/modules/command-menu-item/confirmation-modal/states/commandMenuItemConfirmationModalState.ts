import { type ReactNode } from 'react';

import { type ConfirmationModalCaller } from 'twenty-shared/types';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ButtonColor } from 'twenty-ui/primitives/input';

export type CommandMenuItemConfirmationModalLinkButton = {
  title: string;
  to: string;
};

export type CommandMenuItemConfirmationModalConfig = {
  caller: ConfirmationModalCaller;
  title: string;
  subtitle: ReactNode;
  confirmButtonText?: string;
  confirmButtonColor?: ButtonColor;
  linkButton?: CommandMenuItemConfirmationModalLinkButton;
};

export const commandMenuItemConfirmationModalConfigState =
  createAtomState<CommandMenuItemConfirmationModalConfig | null>({
    key: 'commandMenuItemConfirmationModalConfigState',
    defaultValue: null,
  });
