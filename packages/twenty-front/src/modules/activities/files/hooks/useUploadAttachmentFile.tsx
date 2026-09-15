import { type Attachment } from '@/activities/files/types/Attachment';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { t } from '@lingui/core/macro';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, FileFolder } from '~/generated-metadata/graphql';

export const useUploadAttachmentFile = () => {
  const { uploadFile: directUploadFile } = useDirectFileUpload();
  const { objectMetadataItem: attachmentMetadata } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  const filesFieldMetadataId = attachmentMetadata.fields.find(
    (field) => field.type === FieldMetadataType.FILES && field.name === 'file',
  )?.id;

  const { createOneRecord: createOneAttachment } =
    useCreateOneRecord<Attachment>({
      objectNameSingular: CoreObjectNameSingular.Attachment,
      shouldMatchRootQueryFilter: true,
    });

  const uploadAttachmentFile = async (
    file: File,
    targetableObject: ActivityTargetableObject,
  ) => {
    assertIsDefinedOrThrow(
      filesFieldMetadataId,
      new Error(t`File field not found for attachment object`),
    );

    const uploadedFile = await directUploadFile(file, {
      fileFolder: FileFolder.FilesField,
      fieldMetadataId: filesFieldMetadataId,
    });

    if (!isDefined(uploadedFile)) {
      throw new Error("Couldn't upload the attachment.");
    }

    const targetableObjectFieldIdName = getActivityTargetObjectFieldIdName({
      nameSingular: targetableObject.targetObjectNameSingular,
    });

    const attachmentToCreate = {
      name: file.name,
      [targetableObjectFieldIdName]: targetableObject.id,
      file: [
        {
          fileId: uploadedFile.id,
          label: file.name,
        },
      ],
    } as Partial<Attachment>;

    await createOneAttachment(attachmentToCreate);

    return {
      attachmentAbsoluteURL: uploadedFile.url,
      attachmentFileId: uploadedFile.id,
    };
  };

  return { uploadAttachmentFile };
};
