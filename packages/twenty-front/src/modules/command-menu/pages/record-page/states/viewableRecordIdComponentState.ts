import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const viewableRecordIdComponentState = createAtomComponentState<
  string | null
>({
  key: 'command-menu/viewable-record-id',
  defaultValue: null,
  componentInstanceContext: CommandMenuPageComponentInstanceContext,
});
