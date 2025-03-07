import { MessageThread } from '@/activities/emails/types/MessageThread';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const messageThreadComponentState =
  createComponentStateV2<MessageThread | null>({
    key: 'messageThreadComponentState',
    defaultValue: null,
    componentInstanceContext: CommandMenuPageComponentInstanceContext,
  });
