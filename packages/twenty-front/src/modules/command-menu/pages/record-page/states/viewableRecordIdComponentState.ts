import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const viewableRecordIdComponentState = createComponentState<
  string | null
>({
  key: 'command-menu/viewable-record-id',
  defaultValue: null,
  componentInstanceContext: CommandMenuPageComponentInstanceContext,
});
