import { FieldMetadataType, FileFolder } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { MAX_SANITIZABLE_SVG_BYTES } from 'src/engine/core-modules/file/file-upload/constants/max-sanitizable-svg-size.constant';
import { FileUploadExceptionCode } from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { type FileUploadTargetService } from 'src/engine/core-modules/file/file-upload/services/file-upload-target.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { type FileUploadPrincipal } from 'src/engine/core-modules/file/file-upload/types/file-upload-principal.type';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

describe('FileUploadService.createFileUpload', () => {
  const workspaceId = '20202020-0000-4000-8000-000000000001';
  const fieldMetadataId = '20202020-0000-4000-8000-000000000002';
  const objectMetadataId = '20202020-0000-4000-8000-000000000003';

  const userPrincipal: FileUploadPrincipal = {
    applicationId: null,
    userWorkspaceId: 'user-workspace-1',
    apiKeyId: null,
  };
  const applicationPrincipal: FileUploadPrincipal = {
    applicationId: 'application-a',
    userWorkspaceId: 'user-workspace-1',
    apiKeyId: null,
  };

  let fileStorageService: jest.Mocked<FileStorageService>;
  let fileUploadTargetService: jest.Mocked<FileUploadTargetService>;
  let applicationRepository: jest.Mocked<Repository<ApplicationEntity>>;
  let fieldMetadataRepository: jest.Mocked<Repository<FieldMetadataEntity>>;
  let permissionsService: jest.Mocked<PermissionsService>;

  const buildFilesFieldMetadata = (
    overrides: Partial<FieldMetadataEntity> = {},
  ) =>
    ({
      id: fieldMetadataId,
      applicationId: 'field-owner-application',
      universalIdentifier: 'field-universal-identifier',
      type: FieldMetadataType.FILES,
      objectMetadataId,
      ...overrides,
    }) as FieldMetadataEntity;

  const buildService = () =>
    new FileUploadService(
      fileStorageService,
      {} as never,
      fileUploadTargetService,
      {} as never,
      {} as never,
      applicationRepository,
      fieldMetadataRepository,
      {} as never,
      permissionsService,
    );

  const createUpload = ({
    filename = 'document.pdf',
    size = 10,
    principal = userPrincipal,
  }: {
    filename?: string;
    size?: number;
    principal?: FileUploadPrincipal;
  } = {}) =>
    buildService().createFileUpload({
      workspaceId,
      filename,
      size,
      fileFolder: FileFolder.FilesField,
      fieldMetadataId,
      principal,
    });

  beforeEach(() => {
    fileStorageService = {
      createPendingFile: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<FileStorageService>;

    fileUploadTargetService = {
      buildUploadTarget: jest.fn().mockResolvedValue({
        fileId: 'file-id',
        uploadUrl: 'https://storage.example/upload',
        contentType: 'application/octet-stream',
        expiresAt: new Date(),
      }),
    } as unknown as jest.Mocked<FileUploadTargetService>;

    applicationRepository = {
      findOneOrFail: jest.fn().mockResolvedValue({
        universalIdentifier: 'application-universal-identifier',
      }),
    } as unknown as jest.Mocked<Repository<ApplicationEntity>>;

    fieldMetadataRepository = {
      findOne: jest.fn().mockResolvedValue(buildFilesFieldMetadata()),
    } as unknown as jest.Mocked<Repository<FieldMetadataEntity>>;

    permissionsService = {
      assertApplicationPrincipalCanUpdateFieldOrThrow: jest
        .fn()
        .mockResolvedValue(undefined),
    } as unknown as jest.Mocked<PermissionsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each(['logo.svg', 'logo.SVG', 'logo.Svg'])(
    'should refuse an oversized %s before handing out an upload target',
    async (filename) => {
      await expect(
        createUpload({ filename, size: MAX_SANITIZABLE_SVG_BYTES + 1 }),
      ).rejects.toMatchObject({
        code: FileUploadExceptionCode.FILE_TOO_LARGE,
      });

      expect(fileStorageService.createPendingFile).not.toHaveBeenCalled();
    },
  );

  it('should not refuse an SVG within the limit', async () => {
    await expect(
      createUpload({ filename: 'logo.svg', size: MAX_SANITIZABLE_SVG_BYTES }),
    ).resolves.toMatchObject({ fileId: 'file-id' });
  });

  describe('files field target', () => {
    it('should refuse a field that is not a files field before creating a pending row', async () => {
      fieldMetadataRepository.findOne.mockResolvedValue(
        buildFilesFieldMetadata({ type: FieldMetadataType.TEXT }),
      );

      await expect(createUpload()).rejects.toMatchObject({
        code: FileUploadExceptionCode.BAD_REQUEST,
      });

      expect(fileStorageService.createPendingFile).not.toHaveBeenCalled();
    });

    it('should refuse an unknown field', async () => {
      fieldMetadataRepository.findOne.mockResolvedValue(null);

      await expect(createUpload()).rejects.toMatchObject({
        code: FileUploadExceptionCode.BAD_REQUEST,
      });

      expect(fileStorageService.createPendingFile).not.toHaveBeenCalled();
    });

    it('should refuse an application whose permissions cannot update the object owning the field', async () => {
      permissionsService.assertApplicationPrincipalCanUpdateFieldOrThrow.mockRejectedValue(
        new PermissionsException(
          'denied',
          PermissionsExceptionCode.PERMISSION_DENIED,
        ),
      );

      await expect(
        createUpload({ principal: applicationPrincipal }),
      ).rejects.toMatchObject({
        code: PermissionsExceptionCode.PERMISSION_DENIED,
      });

      expect(
        permissionsService.assertApplicationPrincipalCanUpdateFieldOrThrow,
      ).toHaveBeenCalledWith({
        workspaceId,
        objectMetadataId,
        fieldMetadataId,
        principal: applicationPrincipal,
      });
      expect(fileStorageService.createPendingFile).not.toHaveBeenCalled();
    });

    it('should let an application upload into a field owned by another application when it can update the object', async () => {
      await expect(
        createUpload({ principal: applicationPrincipal }),
      ).resolves.toMatchObject({ fileId: 'file-id' });

      expect(fileStorageService.createPendingFile).toHaveBeenCalledTimes(1);
    });

    it('should store the initiating principal on the pending row', async () => {
      await createUpload({ principal: applicationPrincipal });

      expect(fileStorageService.createPendingFile).toHaveBeenCalledWith(
        expect.objectContaining({
          settings: {
            isTemporaryFile: true,
            toDelete: false,
            uploadPrincipal: applicationPrincipal,
          },
        }),
      );
    });
  });
});
