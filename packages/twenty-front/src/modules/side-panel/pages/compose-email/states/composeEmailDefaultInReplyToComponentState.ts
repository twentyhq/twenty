import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const composeEmailDefaultInReplyToComponentState =
  createAtomComponentState<string>({
    key: 'side-panel/compose-email-default-in-reply-to',
    defaultValue: '',
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
