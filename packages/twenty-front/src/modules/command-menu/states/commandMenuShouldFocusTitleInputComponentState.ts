import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

import { CommandMenuPageComponentInstanceContext } from './contexts/CommandMenuPageComponentInstanceContext';

export const commandMenuShouldFocusTitleInputComponentState =
  createComponentState<boolean>({
    key: 'commandMenuShouldFocusTitleInputComponentState',
    defaultValue: false,
    componentInstanceContext: CommandMenuPageComponentInstanceContext,
  });
