import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const commandMenuWorkflowStepIdComponentState = createComponentStateV2<
  string | undefined
>({
  key: 'command-menu/workflow-step-id',
  defaultValue: undefined,
  componentInstanceContext: CommandMenuPageComponentInstanceContext,
});
