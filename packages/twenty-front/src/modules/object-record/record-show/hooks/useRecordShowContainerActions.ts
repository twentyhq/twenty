import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FileFolder } from '~/generated-metadata/graphql';
import { useUploadImageMutation } from '~/generated/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

interface UseRecordShowContainerActionsProps {
  objectNameSingular: string;
  objectRecordId: string;
  recordFromStore: ObjectRecord | null;
}

export const useRecordShowContainerActions = ({
  objectNameSingular,
  objectRecordId,
  recordFromStore,
}: UseRecordShowContainerActionsProps) => {
  const [uploadImage] = useUploadImageMutation();
  const { updateOneRecord } = useUpdateOneRecord({ objectNameSingular });

  const useUpdateOneObjectRecordMutation: RecordUpdateHook = () => {
    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord?.({
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };

  const onUploadPicture = async (file: File) => {
    if (objectNameSingular !== 'person') {
      return;
    }

    const result = await uploadImage({
      variables: {
        file,
        fileFolder: FileFolder.PersonPicture,
      },
    });

    const avatarUrl = result?.data?.uploadImage;

    if (!avatarUrl || isUndefinedOrNull(updateOneRecord) || !recordFromStore) {
      return;
    }

    await updateOneRecord({
      idToUpdate: objectRecordId,
      updateOneRecordInput: {
        avatarUrl,
      },
    });
  };

  return {
    onUploadPicture,
    useUpdateOneObjectRecordMutation,
  };
};
