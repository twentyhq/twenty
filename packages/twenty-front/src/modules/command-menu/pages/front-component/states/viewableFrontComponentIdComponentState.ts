import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const viewableFrontComponentIdComponentState = createComponentStateV2<
  string | null
>({
  key: 'command-menu/viewable-front-component-id',
  defaultValue: null,
  componentInstanceContext: CommandMenuPageComponentInstanceContext,
});
