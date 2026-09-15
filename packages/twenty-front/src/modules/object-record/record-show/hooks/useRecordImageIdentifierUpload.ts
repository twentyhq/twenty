import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getImageIdentifierFieldMetadataItem } from '@/object-metadata/utils/getImageIdentifierFieldMetadataItem';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, FileFolder } from '~/generated-metadata/graphql';

type UseRecordImageIdentifierUploadParams = {
  objectNameSingular: string;
  recordId: string;
};

export const useRecordImageIdentifierUpload = ({
  objectNameSingular,
  recordId,
}: UseRecordImageIdentifierUploadParams) => {
  const { uploadFile } = useDirectFileUpload();
  const { updateOneRecord } = useUpdateOneRecord();

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  const imageIdentifierFieldMetadataItem =
    getImageIdentifierFieldMetadataItem(objectMetadataItem);

  const filesImageIdentifierFieldMetadataItem =
    imageIdentifierFieldMetadataItem?.type === FieldMetadataType.FILES
      ? imageIdentifierFieldMetadataItem
      : undefined;

  const isImageIdentifierFieldReadOnly = useIsRecordFieldReadOnly({
    recordId,
    objectMetadataId: objectMetadataItem.id,
    fieldMetadataId: filesImageIdentifierFieldMetadataItem?.id ?? '',
  });

  const canUploadImageIdentifier =
    isDefined(filesImageIdentifierFieldMetadataItem) &&
    !isImageIdentifierFieldReadOnly;

  const onUploadPicture = async (file: File) => {
    if (!isDefined(filesImageIdentifierFieldMetadataItem)) {
      return;
    }

    const uploadedFile = await uploadFile(file, {
      fileFolder: FileFolder.FilesField,
      fieldMetadataId: filesImageIdentifierFieldMetadataItem.id,
    });

    await updateOneRecord({
      objectNameSingular,
      idToUpdate: recordId,
      updateOneRecordInput: {
        [filesImageIdentifierFieldMetadataItem.name]: [
          {
            fileId: uploadedFile.id,
            label: file.name,
          },
        ],
      },
    });
  };

  return {
    onUploadPicture: canUploadImageIdentifier ? onUploadPicture : undefined,
  };
};
