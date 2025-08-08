import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const commandMenuWorkflowIdComponentState = createComponentState<
  string | undefined
>({
  key: 'command-menu/workflow-id',
  defaultValue: undefined,
  componentInstanceContext: CommandMenuPageComponentInstanceContext,
});
