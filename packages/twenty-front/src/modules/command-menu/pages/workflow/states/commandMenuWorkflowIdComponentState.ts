import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const commandMenuWorkflowIdComponentState = createComponentStateV2<
  string | undefined
>({
  key: 'command-menu/workflow-id',
  defaultValue: undefined,
  componentInstanceContext: CommandMenuPageComponentInstanceContext,
});
