import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const commandMenuWorkflowVersionIdComponentState =
  createAtomComponentState<string | undefined>({
    key: 'command-menu/workflow-version-id',
    defaultValue: undefined,
    componentInstanceContext: CommandMenuPageComponentInstanceContext,
  });
