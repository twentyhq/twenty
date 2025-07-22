import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';

export const IsAgentChatCurrentContextActiveInstanceContext =
  createComponentInstanceContext();

export const isAgentChatCurrentContextActiveState =
  createComponentStateV2<boolean>({
    defaultValue: true,
    key: 'isAgentChatCurrentContextActiveState',
    componentInstanceContext: IsAgentChatCurrentContextActiveInstanceContext,
  });
