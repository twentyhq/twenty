import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const currentAIChatThreadComponentState = createComponentState<
  string | null
>({
  key: 'currentAIChatThreadComponentState',
  defaultValue: null,
  componentInstanceContext: CommandMenuPageComponentInstanceContext,
});
