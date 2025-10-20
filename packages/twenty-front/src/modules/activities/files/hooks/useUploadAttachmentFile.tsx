import { type Attachment } from '@/activities/files/types/Attachment';
import { getFileType } from '@/activities/files/utils/getFileType';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { isDefined } from 'twenty-shared/utils';
import {
  FileFolder,
  useUploadFileMutation,
} from '~/generated-metadata/graphql';

export const useUploadAttachmentFile = () => {
  const coreClient = useApolloCoreClient();
  const [uploadFile] = useUploadFileMutation({ client: coreClient });

  const { createOneRecord: createOneAttachment } =
    useCreateOneRecord<Attachment>({
      objectNameSingular: CoreObjectNameSingular.Attachment,
      shouldMatchRootQueryFilter: true,
    });

  const uploadAttachmentFile = async (
    file: File,
    targetableObject: ActivityTargetableObject,
  ) => {
    const result = await uploadFile({
      variables: {
        file,
        fileFolder: FileFolder.Attachment,
      },
    });

    const signedFile = result?.data?.uploadFile;

    if (!isDefined(signedFile)) {
      throw new Error("Couldn't upload the attachment.");
    }

    const { path: attachmentPath } = signedFile;

    const targetableObjectFieldIdName = getActivityTargetObjectFieldIdName({
      nameSingular: targetableObject.targetObjectNameSingular,
    });

    const attachmentToCreate = {
      name: file.name,
      fullPath: attachmentPath,
      fileCategory: getFileType(file.name),
      [targetableObjectFieldIdName]: targetableObject.id,
    } as Partial<Attachment>;

    const createdAttachment = await createOneAttachment(attachmentToCreate);

    return { attachmentAbsoluteURL: createdAttachment.fullPath };
  };

  return { uploadAttachmentFile };
};
