import { createComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilyStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const emptyRecordGroupByIdComponentFamilyState =
  createComponentFamilyStateV2<boolean, string>({
    key: 'emptyRecordGroupByIdComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: ViewComponentInstanceContext,
  });
