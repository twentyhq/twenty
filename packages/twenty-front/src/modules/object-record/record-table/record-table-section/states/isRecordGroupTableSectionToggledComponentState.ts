import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const isRecordGroupTableSectionToggledComponentState =
  createComponentFamilyState<boolean, RecordGroupDefinition['id']>({
    key: 'isRecordGroupTableSectionToggledComponentState',
    defaultValue: true,
    componentInstanceContext: ViewComponentInstanceContext,
  });
