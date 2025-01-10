import { useRecoilValue } from 'recoil';

import { Attachment } from '@/activities/files/types/Attachment';
import { getFileType } from '@/activities/files/utils/getFileType';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { isNonEmptyString } from '@sniptt/guards';
import { FileFolder, useUploadFileMutation } from '~/generated/graphql';

// Note: This is probably not the right way to do this.
export const computePathWithoutToken = (attachmentPath: string): string => {
  return attachmentPath.replace(/\?token=[^&]*$/, '');
};

export const useUploadAttachmentFile = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const [uploadFile] = useUploadFileMutation();

  const { createOneRecord: createOneAttachment } =
    useCreateOneRecord<Attachment>({
      objectNameSingular: CoreObjectNameSingular.Attachment,
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

    const attachmentPath = result?.data?.uploadFile;

    if (!isNonEmptyString(attachmentPath)) {
      throw new Error("Couldn't upload the attachment.");
    }

    const targetableObjectFieldIdName = getActivityTargetObjectFieldIdName({
      nameSingular: targetableObject.targetObjectNameSingular,
    });

    const attachmentToCreate = {
      authorId: currentWorkspaceMember?.id,
      name: file.name,
      fullPath: computePathWithoutToken(attachmentPath),
      type: getFileType(file.name),
      [targetableObjectFieldIdName]: targetableObject.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Partial<Attachment>;

    const createdAttachment = await createOneAttachment(attachmentToCreate);

    return { attachmentAbsoluteURL: createdAttachment.fullPath };
  };

  return { uploadAttachmentFile };
};
