import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const emptyRecordGroupByIdComponentFamilyState =
  createAtomComponentFamilyState<boolean, string>({
    key: 'emptyRecordGroupByIdComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: ViewComponentInstanceContext,
  });
