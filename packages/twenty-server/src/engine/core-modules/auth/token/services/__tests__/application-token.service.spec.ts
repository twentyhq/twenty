import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';

describe('ApplicationTokenService', () => {
  const jwtWrapperService = {
    signAsyncOrThrow: jest.fn(),
  };
  const workspaceRepository = {
    findOne: jest.fn(),
  };
  const applicationRepository = {
    findOne: jest.fn(),
  };
  const twentyConfigService = {
    get: jest.fn(),
  };

  const createService = () =>
    new ApplicationTokenService(
      jwtWrapperService as never,
      workspaceRepository as never,
      applicationRepository as never,
      twentyConfigService as never,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    twentyConfigService.get.mockReturnValue('15m');
    jwtWrapperService.signAsyncOrThrow.mockResolvedValue('signed-token');
  });

  it('mints a non-refreshable token for the exact pending workspace deletion', async () => {
    const workspaceDeletedAt = new Date('2026-08-18T10:00:00.000Z');

    workspaceRepository.findOne.mockResolvedValue({
      id: 'workspace-id',
      deletedAt: workspaceDeletedAt,
      applicationUninstallHooksCompletedAt: null,
    });
    applicationRepository.findOne.mockResolvedValue({ id: 'application-id' });

    await createService().generateWorkspaceDeletionApplicationAccessToken({
      workspaceId: 'workspace-id',
      applicationId: 'application-id',
      workspaceDeletionRequestTimestamp: workspaceDeletedAt.toISOString(),
    });

    expect(jwtWrapperService.signAsyncOrThrow).toHaveBeenCalledWith(
      {
        sub: 'application-id',
        applicationId: 'application-id',
        workspaceId: 'workspace-id',
        type: JwtTokenTypeEnum.APPLICATION_ACCESS,
        workspaceDeletionRequestTimestamp: workspaceDeletedAt.toISOString(),
      },
      { expiresIn: '15m' },
    );
  });
});
