import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { FileUploadExceptionCode } from 'src/engine/core-modules/file/file-upload/file-upload.exception';

describe('FileCorePictureService.completeWorkspaceLogoUpload', () => {
  const workspaceId = '20202020-0000-4000-8000-000000000001';
  const previousLogoFileId = '20202020-0000-4000-8000-000000000002';
  const concurrentLogoFileId = '20202020-0000-4000-8000-000000000003';
  const logoFileId = '20202020-0000-4000-8000-000000000004';
  const authContext = {
    type: 'user',
    workspace: { id: workspaceId },
    userWorkspaceId: '20202020-0000-4000-8000-000000000005',
  } as unknown as WorkspaceAuthContext;

  const buildService = ({
    logoFileIdUnderLock,
    isTemporaryFileUnderLock,
  }: {
    logoFileIdUnderLock: string;
    isTemporaryFileUnderLock: boolean;
  }) => {
    const manager = {
      findOneOrFail: jest.fn().mockResolvedValue({
        id: workspaceId,
        logoFileId: logoFileIdUnderLock,
      }),
      update: jest.fn(),
    };
    const transactionalFileRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: logoFileId,
        settings: {
          isTemporaryFile: isTemporaryFileUnderLock,
          toDelete: false,
        },
      }),
      update: jest.fn(),
    };
    const fileStorageService = { deleteFile: jest.fn() };

    const service = new FileCorePictureService(
      fileStorageService as never,
      {
        findOneOrFail: jest.fn().mockResolvedValue({
          id: workspaceId,
          logoFileId: previousLogoFileId,
        }),
        manager: {
          transaction: jest.fn(
            (run: (entityManager: typeof manager) => unknown) => run(manager),
          ),
        },
      } as never,
      {} as never,
      {
        findOne: jest.fn().mockResolvedValue({
          id: logoFileId,
          path: `core-picture/${logoFileId}.png`,
          settings: { isTemporaryFile: true, toDelete: false },
        }),
        withManager: jest.fn().mockReturnValue(transactionalFileRepository),
      } as never,
      {} as never,
      {} as never,
      {
        completeFileUpload: jest.fn().mockResolvedValue({ id: logoFileId }),
      } as never,
      { invalidate: jest.fn() } as never,
    );

    return {
      service,
      manager,
      transactionalFileRepository,
      fileStorageService,
    };
  };

  it('should refuse a file bound and replaced while its completion waited for the workspace lock', async () => {
    const {
      service,
      manager,
      transactionalFileRepository,
      fileStorageService,
    } = buildService({
      logoFileIdUnderLock: concurrentLogoFileId,
      isTemporaryFileUnderLock: false,
    });

    await expect(
      service.completeWorkspaceLogoUpload({
        workspaceId,
        fileId: logoFileId,
        authContext,
      }),
    ).rejects.toMatchObject({ code: FileUploadExceptionCode.BAD_REQUEST });

    expect(manager.update).not.toHaveBeenCalled();
    expect(transactionalFileRepository.update).not.toHaveBeenCalled();
    expect(fileStorageService.deleteFile).not.toHaveBeenCalled();
  });

  it('should leave the logo as is when a concurrent completion of the same file bound it first', async () => {
    const { service, manager, fileStorageService } = buildService({
      logoFileIdUnderLock: logoFileId,
      isTemporaryFileUnderLock: false,
    });

    await expect(
      service.completeWorkspaceLogoUpload({
        workspaceId,
        fileId: logoFileId,
        authContext,
      }),
    ).resolves.toMatchObject({ id: logoFileId });

    expect(manager.update).not.toHaveBeenCalled();
    expect(fileStorageService.deleteFile).not.toHaveBeenCalled();
  });
});
