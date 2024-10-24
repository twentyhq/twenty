import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const recordBoardColumnsComponentFamilyState =
  createComponentFamilyState<RecordGroupDefinition | undefined, string>({
    key: 'recordBoardColumnsComponentFamilyState',
    defaultValue: undefined,
  });
