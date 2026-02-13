import { type Attachment } from '@/activities/files/types/Attachment';
import { getFileType } from '@/activities/files/utils/getFileType';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useApolloClient } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  FieldMetadataType,
  FileFolder,
  useUploadFileMutation,
  useUploadFilesFieldFileMutation,
} from '~/generated-metadata/graphql';

export const useUploadAttachmentFile = () => {
  const apolloClient = useApolloClient();
  const [uploadFile] = useUploadFileMutation({ client: apolloClient });
  const [uploadFilesFieldFile] = useUploadFilesFieldFileMutation({
    client: apolloClient,
  });
  const isAttachmentMigrated = useIsFeatureEnabled(
    FeatureFlagKey.IS_ATTACHMENT_MIGRATED,
  );
  const isFilesFieldMigrated = useIsFeatureEnabled(
    FeatureFlagKey.IS_FILES_FIELD_MIGRATED,
  );

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
    let attachmentPath: string;
    let fileId: string | undefined;
    let fileUrl: string | undefined;

    if (isFilesFieldMigrated) {
      assertIsDefinedOrThrow(
        filesFieldMetadataId,
        new Error(t`File field not found for attachment object`),
      );

      const result = await uploadFilesFieldFile({
        variables: { file, fieldMetadataId: filesFieldMetadataId },
      });

      const uploadedFile = result?.data?.uploadFilesFieldFile;

      if (!isDefined(uploadedFile)) {
        throw new Error("Couldn't upload the attachment.");
      }

      attachmentPath = uploadedFile.path;
      fileId = uploadedFile.id;
      fileUrl = uploadedFile.url;
    } else {
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

      attachmentPath = signedFile.path;
    }

    const targetableObjectFieldIdName = getActivityTargetObjectFieldIdName({
      nameSingular: targetableObject.targetObjectNameSingular,
      isMorphRelation: isAttachmentMigrated,
    });

    const attachmentToCreate = {
      name: file.name,
      fullPath: isFilesFieldMigrated ? null : attachmentPath,
      fileCategory: getFileType(file.name),
      [targetableObjectFieldIdName]: targetableObject.id,
      ...(isFilesFieldMigrated && isDefined(fileId)
        ? {
            file: [
              {
                fileId,
                label: file.name,
              },
            ],
          }
        : {}),
    } as Partial<Attachment>;

    const createdAttachment = await createOneAttachment(attachmentToCreate);

    return {
      attachmentAbsoluteURL: isFilesFieldMigrated
        ? fileUrl
        : createdAttachment.fullPath,
      attachmentFileId: fileId,
    };
  };

  return { uploadAttachmentFile };
};
