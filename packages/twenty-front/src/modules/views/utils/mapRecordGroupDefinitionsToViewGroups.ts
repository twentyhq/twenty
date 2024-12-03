import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { ViewGroup } from '@/views/types/ViewGroup';
import { recordGroupDefinitionToViewGroup } from '@/views/utils/recordGroupDefinitionToViewGroup';

export const mapRecordGroupDefinitionsToViewGroups = (
  groupDefinitions: RecordGroupDefinition[],
): ViewGroup[] => {
  return groupDefinitions.map(recordGroupDefinitionToViewGroup);
};
