import { MessageThread } from '@/activities/emails/types/MessageThread';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const messageThreadComponentState =
  createComponentState<MessageThread | null>({
    key: 'messageThreadComponentState',
    defaultValue: null,
    componentInstanceContext: CommandMenuPageComponentInstanceContext,
  });
