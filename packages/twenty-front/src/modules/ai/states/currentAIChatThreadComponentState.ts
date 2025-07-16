import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const currentAIChatThreadComponentState = createComponentStateV2<
  string | null
>({
  key: 'currentAIChatThreadComponentState',
  defaultValue: null,
  componentInstanceContext: CommandMenuPageComponentInstanceContext,
});
