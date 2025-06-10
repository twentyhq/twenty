import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const viewableRecordNameSingularComponentState = createComponentStateV2<
  string | null
>({
  key: 'command-menu/viewable-record-name-singular',
  defaultValue: null,
  componentInstanceContext: CommandMenuPageComponentInstanceContext,
});
