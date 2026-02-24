import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const shouldCompactRecordIndexLabelIdentifierComponentState =
  createComponentStateV2<boolean>({
    key: 'shouldCompactRecordIndexLabelIdentifierComponentState',
    componentInstanceContext: ContextStoreComponentInstanceContext,
    defaultValue: false,
  });
