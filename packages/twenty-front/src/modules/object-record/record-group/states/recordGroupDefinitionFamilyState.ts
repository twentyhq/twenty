import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';

export const recordGroupDefinitionFamilyState = createAtomFamilyState<
  RecordGroupDefinition | undefined,
  RecordGroupDefinition['id']
>({
  key: 'recordGroupDefinitionFamilyState',
  defaultValue: undefined,
});
