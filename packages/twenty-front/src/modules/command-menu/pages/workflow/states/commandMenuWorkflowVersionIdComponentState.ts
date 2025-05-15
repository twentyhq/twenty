import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const commandMenuWorkflowVersionIdComponentState =
  createComponentStateV2<string | undefined>({
    key: 'command-menu/workflow-version-id',
    defaultValue: undefined,
    componentInstanceContext: CommandMenuPageComponentInstanceContext,
  });
