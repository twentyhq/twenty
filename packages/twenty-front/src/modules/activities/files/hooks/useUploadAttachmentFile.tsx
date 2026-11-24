import { type Attachment } from '@/activities/files/types/Attachment';
import { getAttachmentTargetJoinColumnName } from '@/activities/files/utils/getAttachmentTargetJoinColumnName';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, FileFolder } from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';

export const useUploadAttachmentFile = () => {
  const { t } = useLingui();
  const { uploadFile: directUploadFile } = useDirectFileUpload();
  const { objectMetadataItem: attachmentMetadata } = useObjectMetadataItem({
    objectNameSingular: StandardObjectNameSingular.Attachment,
  });
  const { objectMetadataItems } = useObjectMetadataItems();

  const filesFieldMetadataId = attachmentMetadata.fields.find(
    (field) => field.type === FieldMetadataType.FILES && field.name === 'file',
  )?.id;

  const { createOneRecord: createOneAttachment } =
    useCreateOneRecord<Attachment>({
      objectNameSingular: StandardObjectNameSingular.Attachment,
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

    const attachmentTargetJoinColumnName = getAttachmentTargetJoinColumnName({
      attachmentObjectMetadataItem: attachmentMetadata,
      targetObjectNameSingular: targetableObject.targetObjectNameSingular,
      objectMetadataItems,
    });

    assertIsDefinedOrThrow(
      attachmentTargetJoinColumnName,
      new Error(t`Files can't be attached to this record`),
    );

    const uploadedFile = await directUploadFile(file, {
      fileFolder: FileFolder.FilesField,
      fieldMetadataId: filesFieldMetadataId,
    });

    if (!isDefined(uploadedFile)) {
      throw new Error(t`Couldn't upload the attachment.`);
    }

    const attachmentToCreate = {
      name: file.name,
      [attachmentTargetJoinColumnName]: targetableObject.id,
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
