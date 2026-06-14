import { Test, type TestingModule } from '@nestjs/testing';

import { MaintenanceModeService } from 'src/engine/core-modules/admin-panel/maintenance-mode.service';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { ClientConfigResolver } from './client-config.resolver';

describe('ClientConfigResolver', () => {
  let resolver: ClientConfigResolver;
  let maintenanceModeService: MaintenanceModeService;

  const mockUser = {
    id: 'user-id',
  } as AuthContextUser;

  const mockWorkspace = {
    id: 'workspace-id',
  } as WorkspaceEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientConfigResolver,
        {
          provide: MaintenanceModeService,
          useValue: {
            dismissMaintenanceModeBanner: jest.fn(),
            isMaintenanceModeBannerDismissed: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<ClientConfigResolver>(ClientConfigResolver);
    maintenanceModeService = module.get<MaintenanceModeService>(
      MaintenanceModeService,
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should return dismissal state from maintenance mode service', async () => {
    jest
      .spyOn(maintenanceModeService, 'isMaintenanceModeBannerDismissed')
      .mockResolvedValue(true);

    const result = await resolver.isMaintenanceModeBannerDismissed(
      mockUser,
      mockWorkspace,
    );

    expect(result).toBe(true);
    expect(
      maintenanceModeService.isMaintenanceModeBannerDismissed,
    ).toHaveBeenCalledWith(mockUser.id, mockWorkspace.id);
  });

  it('should persist dismissal through maintenance mode service', async () => {
    jest
      .spyOn(maintenanceModeService, 'dismissMaintenanceModeBanner')
      .mockResolvedValue();

    const result = await resolver.dismissMaintenanceModeBanner(
      mockUser,
      mockWorkspace,
    );

    expect(result).toBe(true);
    expect(
      maintenanceModeService.dismissMaintenanceModeBanner,
    ).toHaveBeenCalledWith(mockUser.id, mockWorkspace.id);
  });
});
