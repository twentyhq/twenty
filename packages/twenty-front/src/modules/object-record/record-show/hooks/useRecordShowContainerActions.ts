import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  type RecordUpdateHook,
  type RecordUpdateHookParams,
} from '@/object-record/record-field/ui/contexts/FieldContext';

interface UseRecordShowContainerActionsProps {
  objectNameSingular: string;
}

export const useRecordShowContainerActions = ({
  objectNameSingular,
}: UseRecordShowContainerActionsProps) => {
  const { updateOneRecord } = useUpdateOneRecord();

  const useUpdateOneObjectRecordMutation: RecordUpdateHook = () => {
    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord({
        objectNameSingular,
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };

  return {
    useUpdateOneObjectRecordMutation,
  };
};
