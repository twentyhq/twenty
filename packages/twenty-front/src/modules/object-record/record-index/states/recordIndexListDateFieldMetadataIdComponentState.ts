import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexListDateFieldMetadataIdComponentState =
  createAtomComponentState<string | null>({
    key: 'recordIndexListDateFieldMetadataIdComponentState',
    defaultValue: null,
    componentInstanceContext: ViewComponentInstanceContext,
  });
