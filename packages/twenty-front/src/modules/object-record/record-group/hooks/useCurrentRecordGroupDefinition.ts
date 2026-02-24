import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { useContext } from 'react';

export const useCurrentRecordGroupDefinition = () => {
  const context = useContext(RecordGroupContext);

  const recordGroupDefinition = useFamilyRecoilValueV2(
    recordGroupDefinitionFamilyState,
    context?.recordGroupId ?? '',
  );

  return recordGroupDefinition;
};
