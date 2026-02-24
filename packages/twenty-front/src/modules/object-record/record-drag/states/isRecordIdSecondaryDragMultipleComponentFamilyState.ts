import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilyStateV2';

export const isRecordIdSecondaryDragMultipleComponentFamilyState =
  createComponentFamilyStateV2<boolean, { recordId: string }>({
    key: 'isRecordIdSecondaryDragMultipleComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
