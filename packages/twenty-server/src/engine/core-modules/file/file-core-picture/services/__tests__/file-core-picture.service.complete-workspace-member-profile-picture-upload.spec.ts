import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { FileUploadExceptionCode } from 'src/engine/core-modules/file/file-upload/file-upload.exception';

describe('FileCorePictureService.completeWorkspaceMemberProfilePictureUpload', () => {
  const workspaceId = '20202020-0000-4000-8000-000000000001';
  const pictureFileId = '20202020-0000-4000-8000-000000000002';

  const buildService = ({
    isTemporaryFileUnderLock,
  }: {
    isTemporaryFileUnderLock: boolean;
  }) => {
    const manager = {};
    const transactionalFileRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: pictureFileId,
        settings: {
          isTemporaryFile: isTemporaryFileUnderLock,
          toDelete: false,
        },
      }),
      update: jest.fn(),
    };

    const service = new FileCorePictureService(
      {} as never,
      {
        manager: {
          transaction: jest.fn(
            (run: (entityManager: typeof manager) => unknown) => run(manager),
          ),
        },
      } as never,
      {} as never,
      {
        findOne: jest.fn().mockResolvedValue({
          id: pictureFileId,
          path: `core-picture/${pictureFileId}.png`,
          settings: { isTemporaryFile: true, toDelete: false },
        }),
        withManager: jest.fn().mockReturnValue(transactionalFileRepository),
      } as never,
      {} as never,
      {} as never,
      {
        completeFileUpload: jest.fn().mockResolvedValue({ id: pictureFileId }),
      } as never,
      {} as never,
    );

    return { service, transactionalFileRepository };
  };

  it('should mark the completed picture permanent', async () => {
    const { service, transactionalFileRepository } = buildService({
      isTemporaryFileUnderLock: true,
    });

    await expect(
      service.completeWorkspaceMemberProfilePictureUpload({
        workspaceId,
        fileId: pictureFileId,
      }),
    ).resolves.toMatchObject({ id: pictureFileId });

    expect(transactionalFileRepository.update).toHaveBeenCalledWith(
      workspaceId,
      { id: pictureFileId },
      { settings: { isTemporaryFile: false, toDelete: false } },
    );
  });

  it('should refuse a picture claimed as the workspace logo while its completion ran', async () => {
    const { service, transactionalFileRepository } = buildService({
      isTemporaryFileUnderLock: false,
    });

    await expect(
      service.completeWorkspaceMemberProfilePictureUpload({
        workspaceId,
        fileId: pictureFileId,
      }),
    ).rejects.toMatchObject({ code: FileUploadExceptionCode.BAD_REQUEST });

    expect(transactionalFileRepository.update).not.toHaveBeenCalled();
  });
});
