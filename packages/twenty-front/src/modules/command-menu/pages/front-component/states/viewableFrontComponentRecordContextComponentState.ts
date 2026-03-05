import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

type FrontComponentRecordContext = {
  recordId: string;
  objectNameSingular: string;
};

export const viewableFrontComponentRecordContextComponentState =
  createAtomComponentState<FrontComponentRecordContext | null>({
    key: 'command-menu/viewable-front-component-record-context',
    defaultValue: null,
    componentInstanceContext: CommandMenuPageComponentInstanceContext,
  });
