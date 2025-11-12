import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const emptyRecordGroupByIdComponentFamilyState =
  createComponentFamilyState<boolean, string>({
    key: 'emptyRecordGroupByIdComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: ViewComponentInstanceContext,
  });
