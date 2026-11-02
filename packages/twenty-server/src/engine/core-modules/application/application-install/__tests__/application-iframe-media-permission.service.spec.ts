import { Readable } from 'stream';

import { ApplicationIframeMediaPermissionService } from 'src/engine/core-modules/application/application-install/application-iframe-media-permission.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';

const EXISTING_PERMISSION = {
  origin: 'https://phone.example.com',
  microphone: true,
  camera: false,
};
const NEW_PERMISSION = {
  origin: 'https://video.example.com',
  microphone: true,
  camera: true,
};
const OTHER_PERMISSION = {
  origin: 'https://other.example.com',
  microphone: true,
  camera: false,
};
const APPLICATION = {
  id: 'application-id',
  workspaceId: 'workspace-id',
  universalIdentifier: 'application-universal-identifier',
  grantedIframeMediaPermissions: [EXISTING_PERMISSION],
};

describe('ApplicationIframeMediaPermissionService', () => {
  const applicationService = {
    findOneApplicationOrThrow: jest.fn().mockResolvedValue(APPLICATION),
    update: jest.fn().mockResolvedValue(APPLICATION),
  };
  const fileStorageService = {
    checkFileExists: jest.fn().mockResolvedValue(true),
    readFile: jest.fn().mockImplementation(async () =>
      Readable.from(
        Buffer.from(
          JSON.stringify({
            application: {
              requestedIframeMediaPermissions: [
                EXISTING_PERMISSION,
                NEW_PERMISSION,
                OTHER_PERMISSION,
              ],
            },
          }),
        ),
      ),
    ),
  };
  const service = new ApplicationIframeMediaPermissionService(
    applicationService as unknown as ApplicationService,
    fileStorageService as unknown as FileStorageService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    fileStorageService.checkFileExists.mockResolvedValue(true);
  });

  it('approves a newly requested origin without reinstalling or granting unreviewed origins', async () => {
    await service.approve({
      applicationId: APPLICATION.id,
      workspaceId: APPLICATION.workspaceId,
      approvedIframeMediaPermissions: [NEW_PERMISSION],
    });

    expect(applicationService.update).toHaveBeenCalledWith(APPLICATION.id, {
      workspaceId: APPLICATION.workspaceId,
      grantedIframeMediaPermissions: expect.any(Function),
    });
  });

  it('rejects permissions absent from the installed manifest', async () => {
    await expect(
      service.approve({
        applicationId: APPLICATION.id,
        workspaceId: APPLICATION.workspaceId,
        approvedIframeMediaPermissions: [
          { ...EXISTING_PERMISSION, camera: true },
        ],
      }),
    ).rejects.toBeInstanceOf(ApplicationException);

    expect(applicationService.update).not.toHaveBeenCalled();
  });

  it('keeps grants unchanged when the installed manifest is unavailable', async () => {
    fileStorageService.checkFileExists.mockResolvedValue(false);

    await expect(
      service.approve({
        applicationId: APPLICATION.id,
        workspaceId: APPLICATION.workspaceId,
        approvedIframeMediaPermissions: [NEW_PERMISSION],
      }),
    ).rejects.toBeInstanceOf(ApplicationException);

    expect(applicationService.update).not.toHaveBeenCalled();
  });
});
