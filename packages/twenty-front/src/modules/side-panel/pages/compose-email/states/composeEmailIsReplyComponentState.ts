import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const composeEmailIsReplyComponentState =
  createAtomComponentState<boolean>({
    key: 'side-panel/compose-email-is-reply',
    defaultValue: false,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
