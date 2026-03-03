import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

import { CommandMenuPageComponentInstanceContext } from './contexts/CommandMenuPageComponentInstanceContext';

export const commandMenuShouldFocusTitleInputComponentState =
  createAtomComponentState<boolean>({
    key: 'commandMenuShouldFocusTitleInputComponentState',
    defaultValue: false,
    componentInstanceContext: CommandMenuPageComponentInstanceContext,
  });
