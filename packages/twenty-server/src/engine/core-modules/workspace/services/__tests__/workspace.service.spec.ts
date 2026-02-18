import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { ApprovedAccessDomainEntity } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';
import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { CustomDomainManagerService } from 'src/engine/core-modules/domain/custom-domain-manager/services/custom-domain-manager.service';
import { SubdomainManagerService } from 'src/engine/core-modules/domain/subdomain-manager/services/subdomain-manager.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  let userWorkspaceRepository: Repository<UserWorkspaceEntity>;
  let userRepository: Repository<UserEntity>;
  let workspaceRepository: Repository<WorkspaceEntity>;
  let workspaceCacheStorageService: WorkspaceCacheStorageService;
  let messageQueueService: MessageQueueService;
  let dnsManagerService: DnsManagerService;
  let billingSubscriptionService: BillingSubscriptionService;
  let userWorkspaceService: UserWorkspaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {
            findOne: jest.fn(),
            softDelete: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ApprovedAccessDomainEntity),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: ObjectMetadataService,
          useValue: {
            deleteWorkspaceAllObjectMetadata: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: {
            find: jest.fn(),
            softDelete: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            softDelete: jest.fn(),
          },
        },
        {
          provide: BillingService,
          useValue: {
            isBillingEnabled: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: BillingSubscriptionService,
          useValue: {
            deleteSubscriptions: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: {
            createContext: jest.fn(),
          },
        },
        ...[
          WorkspaceManagerService,
          UserWorkspaceService,
          UserService,
          DnsManagerService,
          CustomDomainManagerService,
          SubdomainManagerService,
          TwentyConfigService,
          EmailService,
          OnboardingService,
          WorkspaceInvitationService,
          PermissionsService,
          FeatureFlagService,
          ExceptionHandlerService,
          PermissionsService,
          FileCorePictureService,
        ].map((service) => ({
          provide: service,
          useValue: {},
        })),
        {
          provide: WorkspaceCacheStorageService,
          useValue: {
            flush: jest.fn(),
          },
        },
        {
          provide: WorkspaceDataSourceService,
          useValue: {
            deleteWorkspaceDBSchema: jest.fn(),
          },
        },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            flushFlatEntityMaps: jest.fn(),
            getOrRecomputeManyOrAllFlatEntityMaps: jest
              .fn()
              .mockResolvedValue(createEmptyAllFlatEntityMaps()),
          },
        },
        {
          provide: UserWorkspaceService,
          useValue: {
            deleteUserWorkspace: jest.fn(),
          },
        },
        {
          provide: getQueueToken(MessageQueue.deleteCascadeQueue),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: getDataSourceToken(),
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: {
                delete: jest.fn().mockResolvedValue({ affected: 0 }),
              },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
    userWorkspaceRepository = module.get<Repository<UserWorkspaceEntity>>(
      getRepositoryToken(UserWorkspaceEntity),
    );
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    workspaceRepository = module.get<Repository<WorkspaceEntity>>(
      getRepositoryToken(WorkspaceEntity),
    );
    workspaceCacheStorageService = module.get<WorkspaceCacheStorageService>(
      WorkspaceCacheStorageService,
    );
    messageQueueService = module.get<MessageQueueService>(
      getQueueToken(MessageQueue.deleteCascadeQueue),
    );
    dnsManagerService = module.get<DnsManagerService>(DnsManagerService);
    dnsManagerService.deleteHostnameSilently = jest.fn();
    billingSubscriptionService = module.get<BillingSubscriptionService>(
      BillingSubscriptionService,
    );
    userWorkspaceService =
      module.get<UserWorkspaceService>(UserWorkspaceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleRemoveWorkspaceMember', () => {
    it('should soft delete the user workspace record', async () => {
      jest.spyOn(userWorkspaceRepository, 'find').mockResolvedValue([
        {
          userId: 'user-id',
          workspaceId: 'workspace-id',
          id: 'user-workspace-id',
        } as UserWorkspaceEntity,
      ]);

      await service.handleRemoveWorkspaceMember(
        'workspace-id',
        'user-id',
        true,
      );

      expect(userWorkspaceService.deleteUserWorkspace).toHaveBeenCalledWith({
        userWorkspaceId: 'user-workspace-id',
        softDelete: true,
      });
      expect(userWorkspaceRepository.delete).not.toHaveBeenCalled();
      expect(userRepository.softDelete).toHaveBeenCalledWith('user-id');
    });
    it('should destroy the user workspace record', async () => {
      jest.spyOn(userWorkspaceRepository, 'find').mockResolvedValue([
        {
          id: 'user-workspace-id',
          userId: 'user-id',
          workspaceId: 'workspace-id',
        } as UserWorkspaceEntity,
      ]);

      await service.handleRemoveWorkspaceMember(
        'workspace-id',
        'user-id',
        false,
      );

      expect(userWorkspaceService.deleteUserWorkspace).toHaveBeenCalledWith({
        userWorkspaceId: 'user-workspace-id',
        softDelete: false,
      });
      expect(userRepository.softDelete).toHaveBeenCalledWith('user-id');
    });

    it('should not soft delete the user record if there are other user workspace records', async () => {
      jest.spyOn(userWorkspaceRepository, 'find').mockResolvedValue([
        {
          id: 'remaining-user-workspace-id',
          userId: 'user-id',
          workspaceId: 'other-workspace-id',
        } as UserWorkspaceEntity,
        {
          id: 'user-workspace-id',
          userId: 'user-id',
          workspaceId: 'workspace-id',
        } as UserWorkspaceEntity,
      ]);

      await service.handleRemoveWorkspaceMember(
        'workspace-id',
        'user-id',
        false,
      );

      expect(userWorkspaceService.deleteUserWorkspace).toHaveBeenCalledWith({
        userWorkspaceId: 'user-workspace-id',
        softDelete: false,
      });
      expect(userWorkspaceService.deleteUserWorkspace).not.toHaveBeenCalledWith(
        {
          userWorkspaceId: 'remaining-user-workspace-id',
          softDelete: false,
        },
      );
      expect(userRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('deleteWorkspace', () => {
    it('should delete the workspace', async () => {
      const mockWorkspace = {
        id: 'workspace-id',
        metadataVersion: 0,
      } as WorkspaceEntity;

      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace);
      jest.spyOn(userWorkspaceRepository, 'find').mockResolvedValue([]);

      await service.deleteWorkspace(mockWorkspace.id, false);

      expect(workspaceRepository.softDelete).not.toHaveBeenCalled();
      expect(workspaceCacheStorageService.flush).toHaveBeenCalledWith(
        mockWorkspace.id,
        mockWorkspace.metadataVersion,
      );
      expect(messageQueueService.add).toHaveBeenCalled();
    });

    it('should soft delete the workspace', async () => {
      const mockWorkspace = {
        id: 'workspace-id',
        metadataVersion: 0,
      } as WorkspaceEntity;

      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace);
      jest.spyOn(userWorkspaceRepository, 'find').mockResolvedValue([]);

      await service.deleteWorkspace(mockWorkspace.id, true);

      expect(billingSubscriptionService.deleteSubscriptions).toHaveBeenCalled();

      expect(workspaceRepository.softDelete).toHaveBeenCalledWith({
        id: mockWorkspace.id,
      });
      expect(workspaceRepository.delete).not.toHaveBeenCalled();
    });

    it('should delete the custom domain when hard deleting a workspace with a custom domain', async () => {
      const customDomain = 'custom.example.com';
      const mockWorkspace = {
        id: 'workspace-id',
        metadataVersion: 0,
        customDomain,
      } as WorkspaceEntity;

      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace);
      jest.spyOn(userWorkspaceRepository, 'find').mockResolvedValue([]);

      await service.deleteWorkspace(mockWorkspace.id, false);

      expect(dnsManagerService.deleteHostnameSilently).toHaveBeenCalledWith(
        customDomain,
      );
    });

    it('should not delete the custom domain when soft deleting a workspace with a custom domain', async () => {
      const customDomain = 'custom.example.com';
      const mockWorkspace = {
        id: 'workspace-id',
        metadataVersion: 0,
        customDomain,
      } as WorkspaceEntity;

      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace);
      jest.spyOn(userWorkspaceRepository, 'find').mockResolvedValue([]);

      await service.deleteWorkspace(mockWorkspace.id, true);

      expect(dnsManagerService.deleteHostnameSilently).not.toHaveBeenCalled();
      expect(workspaceRepository.softDelete).toHaveBeenCalledWith({
        id: mockWorkspace.id,
      });
    });
  });
});
