import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const isRecordGroupTableSectionToggledComponentState =
  createComponentFamilyStateV2<boolean, RecordGroupDefinition['id']>({
    key: 'isRecordGroupTableSectionToggledComponentState',
    defaultValue: true,
    componentInstanceContext: ViewComponentInstanceContext,
  });
