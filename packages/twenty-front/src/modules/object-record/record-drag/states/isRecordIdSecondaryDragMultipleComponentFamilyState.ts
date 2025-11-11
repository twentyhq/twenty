import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const isRecordIdSecondaryDragMultipleComponentFamilyState =
  createComponentFamilyState<boolean, { recordId: string }>({
    key: 'isRecordIdSecondaryDragMultipleComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
