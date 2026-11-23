import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';

describe('FileCorePictureService.copyWorkspaceMemberProfilePicture', () => {
  it('should copy nothing when the source picture no longer exists', async () => {
    const fileStorageService = { readFile: jest.fn() };

    const service = new FileCorePictureService(
      fileStorageService as never,
      {} as never,
      {} as never,
      { findOne: jest.fn().mockResolvedValue(null) } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.copyWorkspaceMemberProfilePicture({
        sourceWorkspaceId: '20202020-0000-4000-8000-000000000001',
        sourceFileId: '20202020-0000-4000-8000-000000000002',
        targetWorkspaceId: '20202020-0000-4000-8000-000000000003',
      }),
    ).resolves.toBeUndefined();

    expect(fileStorageService.readFile).not.toHaveBeenCalled();
  });
});
