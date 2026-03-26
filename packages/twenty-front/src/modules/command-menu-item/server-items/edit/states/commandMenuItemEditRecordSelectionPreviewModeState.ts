import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export type CommandMenuItemEditRecordSelectionPreviewMode =
  | 'none'
  | 'selection';

export const commandMenuItemEditRecordSelectionPreviewModeState =
  createAtomComponentState<CommandMenuItemEditRecordSelectionPreviewMode>({
    key: 'commandMenuItemEditRecordSelectionPreviewModeState',
    defaultValue: 'selection',
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
