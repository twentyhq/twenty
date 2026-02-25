import { type MessageThread } from '@/activities/emails/types/MessageThread';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const messageThreadComponentState =
  createAtomComponentState<MessageThread | null>({
    key: 'messageThreadComponentState',
    defaultValue: null,
    componentInstanceContext: CommandMenuPageComponentInstanceContext,
  });
