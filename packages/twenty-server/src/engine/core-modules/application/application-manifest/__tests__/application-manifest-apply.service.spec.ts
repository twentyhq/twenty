import { Test, type TestingModule } from '@nestjs/testing';

import { type Manifest } from 'twenty-shared/application';

import { ApplicationManifestApplyService } from 'src/engine/core-modules/application/application-manifest/application-manifest-apply.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const REGISTRATION_ID = '20202020-0000-4000-8000-000000000002';
const APPLICATION_ID = '20202020-0000-4000-8000-000000000003';

const buildManifest = (overrides: Record<string, unknown> = {}): Manifest =>
  ({
    application: {
      universalIdentifier: 'my-app',
      displayName: 'My App',
      ...overrides,
    },
  }) as Manifest;

const buildApplication = (version: string | null): ApplicationEntity =>
  ({
    id: APPLICATION_ID,
    universalIdentifier: 'my-app',
    version,
  }) as ApplicationEntity;

describe('ApplicationManifestApplyService', () => {
  let service: ApplicationManifestApplyService;

  const mockApplicationSyncService = {
    synchronizeFromManifest: jest.fn(),
  };

  const mockSdkClientGenerationService = {
    generateSdkClientForApplication: jest.fn(),
  };

  const mockApplicationRegistrationService = {
    findOneByIdGlobal: jest.fn(),
    updateFromManifest: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockApplicationSyncService.synchronizeFromManifest.mockResolvedValue({
      workspaceMigration: { actions: [] },
      hasSchemaMetadataChanged: false,
    });
    mockApplicationRegistrationService.updateFromManifest.mockResolvedValue(
      true,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationManifestApplyService,
        {
          provide: ApplicationSyncService,
          useValue: mockApplicationSyncService,
        },
        {
          provide: SdkClientGenerationService,
          useValue: mockSdkClientGenerationService,
        },
        {
          provide: ApplicationRegistrationService,
          useValue: mockApplicationRegistrationService,
        },
      ],
    }).compile();

    service = module.get(ApplicationManifestApplyService);
  });

  describe('applyManifestToWorkspace', () => {
    it('should generate the SDK client when the application has no version yet', async () => {
      await service.applyManifestToWorkspace({
        workspaceId: WORKSPACE_ID,
        manifest: buildManifest(),
        applicationRegistrationId: REGISTRATION_ID,
        application: buildApplication(null),
      });

      expect(
        mockSdkClientGenerationService.generateSdkClientForApplication,
      ).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        applicationId: APPLICATION_ID,
        applicationUniversalIdentifier: 'my-app',
        trigger: 'manifest-sync',
      });
    });

    it('should generate the SDK client when the schema changed', async () => {
      mockApplicationSyncService.synchronizeFromManifest.mockResolvedValue({
        workspaceMigration: { actions: [] },
        hasSchemaMetadataChanged: true,
      });

      await service.applyManifestToWorkspace({
        workspaceId: WORKSPACE_ID,
        manifest: buildManifest(),
        applicationRegistrationId: REGISTRATION_ID,
        application: buildApplication('1.0.0'),
      });

      expect(
        mockSdkClientGenerationService.generateSdkClientForApplication,
      ).toHaveBeenCalled();
    });

    it('should not generate the SDK client on an unchanged re-apply', async () => {
      await service.applyManifestToWorkspace({
        workspaceId: WORKSPACE_ID,
        manifest: buildManifest(),
        applicationRegistrationId: REGISTRATION_ID,
        application: buildApplication('1.0.0'),
      });

      expect(
        mockSdkClientGenerationService.generateSdkClientForApplication,
      ).not.toHaveBeenCalled();
    });
  });

  describe('refreshRegistrationFromManifest', () => {
    it('should update the registration', async () => {
      const manifest = buildManifest();

      const result = await service.refreshRegistrationFromManifest({
        applicationRegistrationId: REGISTRATION_ID,
        manifest,
        latestAvailableVersion: '1.2.0',
        preventVersionDowngrade: true,
      });

      expect(result).toBe(true);
      expect(
        mockApplicationRegistrationService.updateFromManifest,
      ).toHaveBeenCalledWith({
        applicationRegistrationId: REGISTRATION_ID,
        manifest,
        sourceType: undefined,
        latestAvailableVersion: '1.2.0',
        preventVersionDowngrade: true,
      });
    });

    it('should report a registration update skipped as a downgrade', async () => {
      mockApplicationRegistrationService.updateFromManifest.mockResolvedValue(
        false,
      );

      const result = await service.refreshRegistrationFromManifest({
        applicationRegistrationId: REGISTRATION_ID,
        manifest: buildManifest(),
        latestAvailableVersion: '0.9.0',
        preventVersionDowngrade: true,
      });

      expect(result).toBe(false);
    });

    it('should skip npm-sourced registrations when scoped to a workspace', async () => {
      mockApplicationRegistrationService.findOneByIdGlobal.mockResolvedValue({
        id: REGISTRATION_ID,
        sourceType: ApplicationRegistrationSourceType.NPM,
        ownerWorkspaceId: WORKSPACE_ID,
      });

      const result = await service.refreshRegistrationFromManifest({
        applicationRegistrationId: REGISTRATION_ID,
        manifest: buildManifest(),
        onlyIfOwnedByWorkspaceId: WORKSPACE_ID,
      });

      expect(result).toBe(false);
      expect(
        mockApplicationRegistrationService.updateFromManifest,
      ).not.toHaveBeenCalled();
    });

    it('should skip registrations owned by another workspace when scoped to a workspace', async () => {
      mockApplicationRegistrationService.findOneByIdGlobal.mockResolvedValue({
        id: REGISTRATION_ID,
        sourceType: ApplicationRegistrationSourceType.LOCAL,
        ownerWorkspaceId: 'another-workspace-id',
      });

      const result = await service.refreshRegistrationFromManifest({
        applicationRegistrationId: REGISTRATION_ID,
        manifest: buildManifest(),
        onlyIfOwnedByWorkspaceId: WORKSPACE_ID,
      });

      expect(result).toBe(false);
      expect(
        mockApplicationRegistrationService.updateFromManifest,
      ).not.toHaveBeenCalled();
    });

    it('should update a workspace-owned registration when scoped to that workspace', async () => {
      mockApplicationRegistrationService.findOneByIdGlobal.mockResolvedValue({
        id: REGISTRATION_ID,
        sourceType: ApplicationRegistrationSourceType.LOCAL,
        ownerWorkspaceId: WORKSPACE_ID,
      });

      const result = await service.refreshRegistrationFromManifest({
        applicationRegistrationId: REGISTRATION_ID,
        manifest: buildManifest(),
        sourceType: ApplicationRegistrationSourceType.LOCAL,
        onlyIfOwnedByWorkspaceId: WORKSPACE_ID,
      });

      expect(result).toBe(true);
      expect(
        mockApplicationRegistrationService.updateFromManifest,
      ).toHaveBeenCalled();
    });
  });
});
