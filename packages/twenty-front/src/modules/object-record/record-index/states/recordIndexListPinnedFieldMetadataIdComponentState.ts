import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexListPinnedFieldMetadataIdComponentState =
  createAtomComponentState<string | null>({
    key: 'recordIndexListPinnedFieldMetadataIdComponentState',
    defaultValue: null,
    componentInstanceContext: ViewComponentInstanceContext,
  });
