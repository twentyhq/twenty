import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const IsAgentChatCurrentContextActiveInstanceContext =
  createComponentInstanceContext();

export const isAgentChatCurrentContextActiveState =
  createComponentState<boolean>({
    defaultValue: true,
    key: 'isAgentChatCurrentContextActiveState',
    componentInstanceContext: IsAgentChatCurrentContextActiveInstanceContext,
  });
