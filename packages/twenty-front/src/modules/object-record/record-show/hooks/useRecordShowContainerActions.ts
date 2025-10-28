import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  type RecordUpdateHook,
  type RecordUpdateHookParams,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import {
  FileFolder,
  useUploadImageMutation,
} from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

interface UseRecordShowContainerActionsProps {
  objectNameSingular: string;
  objectRecordId: string;
}

export const useRecordShowContainerActions = ({
  objectNameSingular,
  objectRecordId,
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

    const avatarSignedFile = result?.data?.uploadImage;

    if (!avatarSignedFile || isUndefinedOrNull(updateOneRecord)) {
      return;
    }

    await updateOneRecord({
      idToUpdate: objectRecordId,
      updateOneRecordInput: {
        avatarUrl: avatarSignedFile.path,
      },
    });
  };

  return {
    onUploadPicture,
    useUpdateOneObjectRecordMutation,
  };
};
