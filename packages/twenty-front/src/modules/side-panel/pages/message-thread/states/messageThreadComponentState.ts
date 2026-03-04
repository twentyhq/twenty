import { type MessageThread } from '@/activities/emails/types/MessageThread';
import { SidePanelPageComponentInstanceContext } from '@/command-menu/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const messageThreadComponentState =
  createAtomComponentState<MessageThread | null>({
    key: 'messageThreadComponentState',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
