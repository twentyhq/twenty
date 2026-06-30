import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const shouldCompactRecordIndexLabelIdentifierComponentState =
  createAtomComponentState<boolean>({
    key: 'shouldCompactRecordIndexLabelIdentifierComponentState',
    componentInstanceContext: ContextStoreComponentInstanceContext,
    defaultValue: false,
  });
