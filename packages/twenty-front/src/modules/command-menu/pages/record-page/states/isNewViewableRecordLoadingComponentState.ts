import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const isNewViewableRecordLoadingComponentState =
  createComponentStateV2<boolean>({
    key: 'command-menu/is-new-viewable-record-loading',
    defaultValue: false,
    componentInstanceContext: CommandMenuPageComponentInstanceContext,
  });
