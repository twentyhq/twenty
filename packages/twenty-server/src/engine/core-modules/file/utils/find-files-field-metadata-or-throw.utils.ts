import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FileUploadException,
  FileUploadExceptionCode,
} from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export const findFilesFieldMetadataOrThrow = async ({
  fieldMetadataRepository,
  workspaceId,
  fieldMetadataId,
  fieldMetadataUniversalIdentifier,
}: {
  fieldMetadataRepository: WorkspaceScopedRepository<FieldMetadataEntity>;
  workspaceId: string;
  fieldMetadataId?: string;
  fieldMetadataUniversalIdentifier?: string;
}): Promise<FieldMetadataEntity> => {
  const fieldMetadata = await fieldMetadataRepository.findOne(workspaceId, {
    select: ['id', 'applicationId', 'universalIdentifier', 'type'],
    where: {
      ...(fieldMetadataId ? { id: fieldMetadataId } : {}),
      ...(fieldMetadataUniversalIdentifier
        ? { universalIdentifier: fieldMetadataUniversalIdentifier }
        : {}),
    },
  });

  if (!isDefined(fieldMetadata)) {
    throw new FileUploadException(
      `Files field ${fieldMetadataId ?? fieldMetadataUniversalIdentifier} not found`,
      FileUploadExceptionCode.BAD_REQUEST,
      {
        userFriendlyMessage: msg`The target files field could not be found.`,
      },
    );
  }

  if (fieldMetadata.type !== FieldMetadataType.FILES) {
    throw new FileUploadException(
      `Field ${fieldMetadata.id} is not a files field`,
      FileUploadExceptionCode.BAD_REQUEST,
      {
        userFriendlyMessage: msg`Files can only be uploaded into a files field.`,
      },
    );
  }

  return fieldMetadata;
};
