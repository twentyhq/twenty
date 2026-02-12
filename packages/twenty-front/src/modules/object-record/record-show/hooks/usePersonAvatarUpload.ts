import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import {
  FileFolder,
  useUploadFilesFieldFileMutation,
  useUploadImageMutation,
  FeatureFlagKey,
  FieldMetadataType,
} from '~/generated-metadata/graphql';

export const usePersonAvatarUpload = (personRecordId: string) => {
  const coreClient = useApolloCoreClient();
  const [uploadImage] = useUploadImageMutation();
  const [uploadFilesFieldFile] = useUploadFilesFieldFileMutation({
    client: coreClient,
  });
  const { updateOneRecord } = useUpdateOneRecord();

  const isFilesFieldMigrated = useIsFeatureEnabled(
    FeatureFlagKey.IS_FILES_FIELD_MIGRATED,
  );

  const { objectMetadataItem: personMetadata } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Person,
  });

  const avatarFileFieldMetadataId = personMetadata.fields.find(
    (field) =>
      field.type === FieldMetadataType.FILES && field.name === 'avatarFile',
  )?.id;

  const onUploadPicture = async (file: File) => {
    if (isFilesFieldMigrated) {
      assertIsDefinedOrThrow(
        avatarFileFieldMetadataId,
        new Error(t`Avatar file field not found for person object`),
      );

      const result = await uploadFilesFieldFile({
        variables: { file, fieldMetadataId: avatarFileFieldMetadataId },
      });

      const uploadedFile = result?.data?.uploadFilesFieldFile;

      if (!isDefined(uploadedFile)) {
        return;
      }

      await updateOneRecord({
        objectNameSingular: CoreObjectNameSingular.Person,
        idToUpdate: personRecordId,
        updateOneRecordInput: {
          avatarFile: [
            {
              fileId: uploadedFile.id,
              label: file.name,
            },
          ],
        },
      });
    } else {
      const result = await uploadImage({
        variables: {
          file,
          fileFolder: FileFolder.PersonPicture,
        },
      });

      const avatarSignedFile = result?.data?.uploadImage;

      if (!avatarSignedFile) {
        return;
      }

      await updateOneRecord({
        objectNameSingular: CoreObjectNameSingular.Person,
        idToUpdate: personRecordId,
        updateOneRecordInput: {
          avatarUrl: avatarSignedFile.path,
        },
      });
    }
  };

  return { onUploadPicture };
};
