import { FileFolder } from "~/generated-metadata/graphql";
import { useAddAttachmentMutation, useUploadFileMutation } from "~/generated/graphql";
import { getFileAbsoluteURI } from "~/utils/file/getFileAbsoluteURI";

const useUploadAttachment = () => {
  const [uploadFile] = useUploadFileMutation();
  const [addAttachmentMutation] = useAddAttachmentMutation();

  const uploadAttachment = async (file: File, fileFolder: FileFolder) => {
    // Perform the file upload
    const result = await uploadFile({
      variables: {
        file,
        fileFolder,
      },
    });

    const uploadedFileData = result?.data?.uploadFile;

    // Check if the upload result exists
    if (!uploadedFileData) {
      throw new Error("Couldn't upload the image.");
    }

    // Get the absolute URL of the uploaded file
    const uploadedFileUrl = getFileAbsoluteURI(uploadedFileData);

    // Add the file metadata to the attachment table
    await addAttachmentMutation({
      variables: {
        fileId: uploadedFileData, // Assuming file ID is part of the upload response
        fileName: file.name,
        fileUrl: uploadedFileUrl,
      },
    });

    return uploadedFileUrl;
  };

  return { uploadAttachment };
};

export default useUploadAttachment;
