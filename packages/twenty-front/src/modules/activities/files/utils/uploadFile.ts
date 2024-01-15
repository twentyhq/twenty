import { getFileType } from '@/activities/files/utils/getFileType';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getTargetObjectFilterFieldName';
import { FileFolder } from '~/generated/graphql';

export const uploadAttachFile = async (
  file: File,
  targetableObject: ActivityTargetableObject,
  workspaceMemberId: any,
  createOneAttachment: any,
  uploadFile: any,
) => {
  const result = await uploadFile({
    variables: {
      file,
      fileFolder: FileFolder.Attachment,
    },
  });

  const attachmentUrl = result?.data?.uploadFile;

  if (!attachmentUrl) {
    return;
  }

  const targetableObjectFieldIdName = getActivityTargetObjectFieldIdName({
    nameSingular: targetableObject.targetObjectNameSingular,
  });

  const attachmentToCreate = {
    authorId: workspaceMemberId,
    name: file.name,
    fullPath: attachmentUrl,
    type: getFileType(file.name),
    [targetableObjectFieldIdName]: targetableObject.id,
  };

  await createOneAttachment(attachmentToCreate);
};
