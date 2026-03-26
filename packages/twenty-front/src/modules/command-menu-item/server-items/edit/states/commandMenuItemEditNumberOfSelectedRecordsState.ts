import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const commandMenuItemEditNumberOfSelectedRecordsState =
  createAtomComponentState<number>({
    key: 'commandMenuItemEditNumberOfSelectedRecordsState',
    defaultValue: 0,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
