import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

import { CommandMenuPageComponentInstanceContext } from './contexts/CommandMenuPageComponentInstanceContext';

export const commandMenuShouldFocusTitleInputComponentState =
  createComponentStateV2<boolean>({
    key: 'commandMenuShouldFocusTitleInputComponentState',
    defaultValue: false,
    componentInstanceContext: CommandMenuPageComponentInstanceContext,
  });
