import { type Attachment } from '@/activities/files/types/Attachment';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useApolloClient } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  FieldMetadataType,
  useUploadFilesFieldFileMutation,
} from '~/generated-metadata/graphql';

export const useUploadAttachmentFile = () => {
  const apolloClient = useApolloClient();
  const [uploadFilesFieldFile] = useUploadFilesFieldFileMutation({
    client: apolloClient,
  });
  const isAttachmentMigrated = useIsFeatureEnabled(
    FeatureFlagKey.IS_ATTACHMENT_MIGRATED,
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

    const targetableObjectFieldIdName = getActivityTargetObjectFieldIdName({
      nameSingular: targetableObject.targetObjectNameSingular,
      isMorphRelation: isAttachmentMigrated,
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
