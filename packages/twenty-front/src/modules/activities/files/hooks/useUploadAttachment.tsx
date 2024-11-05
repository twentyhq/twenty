import { FileFolder } from '~/generated-metadata/graphql';
import {
  useAddAttachmentMutation,
  useUploadFileMutation,
} from '~/generated/graphql';
import { getFileAbsoluteURI } from '~/utils/file/getFileAbsoluteURI';

export const useUploadAttachment = () => {
  const [uploadFile] = useUploadFileMutation();
  const [addAttachmentMutation] = useAddAttachmentMutation();

  const uploadAttachment = async (file: File, fileFolder: FileFolder) => {
    const result = await uploadFile({
      variables: {
        file,
        fileFolder,
      },
    });

    const uploadedFileData = result?.data?.uploadFile;

    if (!uploadedFileData) {
      throw new Error("Couldn't upload the image.");
    }

    const uploadedFileUrl = getFileAbsoluteURI(uploadedFileData);

    await addAttachmentMutation({
      variables: {
        fileId: uploadedFileData,
        fileName: file.name,
        fileUrl: uploadedFileUrl,
      },
    });

    return uploadedFileUrl;
  };

  return { uploadAttachment };
};
