import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { useFamilyAtomValue } from '@/ui/utilities/state/jotai/hooks/useFamilyAtomValue';
import { useContext } from 'react';

export const useCurrentRecordGroupDefinition = () => {
  const context = useContext(RecordGroupContext);

  const recordGroupDefinition = useFamilyAtomValue(
    recordGroupDefinitionFamilyState,
    context?.recordGroupId ?? '',
  );

  return recordGroupDefinition;
};
