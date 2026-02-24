import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const shouldCompactRecordIndexLabelIdentifierComponentState =
  createComponentState<boolean>({
    key: 'shouldCompactRecordIndexLabelIdentifierComponentState',
    componentInstanceContext: ContextStoreComponentInstanceContext,
    defaultValue: false,
  });
