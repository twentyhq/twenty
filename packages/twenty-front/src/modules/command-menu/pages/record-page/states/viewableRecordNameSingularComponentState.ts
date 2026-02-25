import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const viewableRecordNameSingularComponentState =
  createAtomComponentState<string | null>({
    key: 'command-menu/viewable-record-name-singular',
    defaultValue: null,
    componentInstanceContext: CommandMenuPageComponentInstanceContext,
  });
