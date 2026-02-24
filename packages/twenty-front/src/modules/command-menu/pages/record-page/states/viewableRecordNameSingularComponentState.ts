import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const viewableRecordNameSingularComponentState = createComponentState<
  string | null
>({
  key: 'command-menu/viewable-record-name-singular',
  defaultValue: null,
  componentInstanceContext: CommandMenuPageComponentInstanceContext,
});
