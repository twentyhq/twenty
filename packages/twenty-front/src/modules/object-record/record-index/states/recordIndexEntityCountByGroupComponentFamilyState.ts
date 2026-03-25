import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexEntityCountByGroupComponentFamilyState =
  createAtomComponentFamilyState<
    number | undefined,
    RecordGroupDefinition['id']
  >({
    key: 'recordIndexEntityCountByGroupComponentFamilyState',
    defaultValue: undefined,
    componentInstanceContext: ViewComponentInstanceContext,
  });
